/*Specifications:
    This is Step 2 in initializing the vision system. Compile the locate_cameras.cc
    file by the following command

    g++ -std=c++11 locate_cameras.cc (PATH TO)/cs-reminibot/vision
    `pkg-config --libs --cflags opencv` -l apriltag -o locate_cameras.o

    (Here --cflags are what you got while installing the opencv system)

    Once you have the locate_cameras.o file, you run


    ./locate_camera.x 0.calib


    Once the camera window opens up, make sure to have the april tags placed within the frame
    all side by side in the following order: ID 0 (top left), ID 1 (top right), ID 2 (bottom left)
    and ID 3 (bottom right). This makes the center of the tags the origin of the coordinate system.
    (You will see a bunch of values being printed in the terminal)
    Colored lines will appear around the tags. Once done, you can stop the command.

*/

#include <apriltag/apriltag.h>
#include <apriltag/tag36h11.h>
#include <apriltag/tag36artoolkit.h>
#include <iostream>
#include <fstream>
#include <opencv2/opencv.hpp>
#include <stdio.h>
#include <stdlib.h>
#include <vector>

using namespace cv;
using std::vector;

#define TAG_SIZE 6.5f

int main(int argc, char** argv) {
    // Display usage
    if (argc < 2) {
        printf("Usage: %s [cameras...]\n", argv[0]);
        return -1;
    }

    // Parse arguments
    vector<VideoCapture> devices;
    vector<int> device_ids;
    vector<Mat> device_camera_matrix;
    vector<Mat> device_dist_coeffs;

    for (int i = 1; i < argc; i++) {
        int id = atoi(argv[i]);
        VideoCapture device(id);
        if (!device.isOpened()) {
            std::cerr << "Failed to open video capture device " << id << std::endl;
            continue;
        }

        std::ifstream fin;
        fin.open(argv[i]);
        if (fin.fail()) {
            std::cerr << "Failed to open file " << argv[i] << std::endl;
            continue;
        }

        Mat camera_matrix, dist_coeffs;
        std::string line;
        // TODO Error checking
        while (std::getline(fin, line)) {
            std::stringstream line_stream(line);
            std::string key, equals;
            line_stream >> key >> equals;
            if (key == "camera_matrix") {
                vector<double> data;
                for (int i = 0; i < 9; i++) {
                    double v;
                    line_stream >> v;
                    data.push_back(v);
                }
                camera_matrix = Mat(data, true).reshape(1, 3);
            }
            else if (key == "dist_coeffs") {
                vector<double> data;
                for (int i = 0; i < 5; i++) {
                    double v;
                    line_stream >> v;
                    data.push_back(v);
                }
                dist_coeffs = Mat(data, true).reshape(1, 1);
            }
            else {
                std::cerr << "Unrecognized key '" << key << "' in file " << argv[i] << std::endl;
            }
        }

        if (camera_matrix.rows != 3 || camera_matrix.cols != 3) {
            std::cerr << "Error reading camera_matrix in file " << argv[i] << std::endl;
            continue;
        }

        if (dist_coeffs.rows != 1 || dist_coeffs.cols != 5) {
            std::cerr << "Error reading dist_coeffs in file " << argv[i] << std::endl;
            continue;
        }

        device.set(CV_CAP_PROP_FRAME_WIDTH, 1280);
        device.set(CV_CAP_PROP_FRAME_HEIGHT, 720);
        device.set(CV_CAP_PROP_FPS, 30);

        devices.push_back(device);
        device_ids.push_back(id);
        device_camera_matrix.push_back(camera_matrix);
        device_dist_coeffs.push_back(dist_coeffs);
    }

    // Initialize detector
    apriltag_family_t* tf = tag36h11_create();
    tf->black_border = 1;

    apriltag_detector_t* td = apriltag_detector_create();
    apriltag_detector_add_family(td, tf);
    td->quad_decimate = 1.0;
    td->quad_sigma = 0.0;
    td->nthreads = 4;
    td->debug = 0;
    td->refine_edges = 1;
    td->refine_decode = 0;
    td->refine_pose = 0;

    int key = 0;
    Mat frame, gray;
    while (key != 27) { // Quit on escape keypress
        for (size_t i = 0; i < devices.size(); i++) {
            if (!devices[i].isOpened()) {
                continue;
            }

            devices[i] >> frame;
            cvtColor(frame, gray, COLOR_BGR2GRAY);
            image_u8_t im = {
                .width = gray.cols,
                .height = gray.rows,
                .stride = gray.cols,
                .buf = gray.data
            };

            zarray_t* detections = apriltag_detector_detect(td, &im);

            vector<Point2f> img_points(16);
            vector<Point3f> obj_points(16);
            Mat rvec(3, 1, CV_64FC1);
            Mat tvec(3, 1, CV_64FC1);
            for (int j = 0; j < zarray_size(detections); j++) {
                // Get the ith detection
                apriltag_detection_t *det;
                zarray_get(detections, j, &det);
                if ((det -> id) <= 3) {
                    int id = det -> id;
                    // Draw onto the frame
                    line(frame, Point(det->p[0][0], det->p[0][1]),
                            Point(det->p[1][0], det->p[1][1]),
                            Scalar(0, 0xff, 0), 2);
                    line(frame, Point(det->p[0][0], det->p[0][1]),
                            Point(det->p[3][0], det->p[3][1]),
                            Scalar(0, 0, 0xff), 2);
                    line(frame, Point(det->p[1][0], det->p[1][1]),
                            Point(det->p[2][0], det->p[2][1]),
                            Scalar(0xff, 0, 0), 2);
                    line(frame, Point(det->p[2][0], det->p[2][1]),
                            Point(det->p[3][0], det->p[3][1]),
                            Scalar(0xff, 0, 0), 2);

                    // Compute transformation using PnP
                    img_points[0 + 4*id] = Point2f(det->p[0][0], det->p[0][1]);
                    img_points[1 + 4*id] = Point2f(det->p[1][0], det->p[1][1]);
                    img_points[2 + 4*id] = Point2f(det->p[2][0], det->p[2][1]);
                    img_points[3 + 4*id] = Point2f(det->p[3][0], det->p[3][1]);

                    int a = (det->id % 2) * 2 - 1;
                    int b = -((det->id / 2) * 2 - 1);
                    obj_points[0 + 4*id] = Point3f(-0.5f * TAG_SIZE + a * 8.5f * 0.5f, -0.5f * TAG_SIZE + b * 11.0f * 0.5f, 0.f);
                    obj_points[1 + 4*id] = Point3f( 0.5f * TAG_SIZE + a * 8.5f * 0.5f, -0.5f * TAG_SIZE + b * 11.0f * 0.5f, 0.f);
                    obj_points[2 + 4*id] = Point3f( 0.5f * TAG_SIZE + a * 8.5f * 0.5f,  0.5f * TAG_SIZE + b * 11.0f * 0.5f, 0.f);
                    obj_points[3 + 4*id] = Point3f(-0.5f * TAG_SIZE + a * 8.5f * 0.5f,  0.5f * TAG_SIZE + b * 11.0f * 0.5f, 0.f);
                }
            }

            solvePnP(obj_points, img_points, device_camera_matrix[i],
                device_dist_coeffs[i], rvec, tvec);

            Matx33d r;
            Rodrigues(rvec,r);

            // Construct the origin to camera matrix
            vector<double> data;
            data.push_back(r(0,0));
            data.push_back(r(0,1));
            data.push_back(r(0,2));
            data.push_back(tvec.at<double>(0));
            data.push_back(r(1,0));
            data.push_back(r(1,1));
            data.push_back(r(1,2));
            data.push_back(tvec.at<double>(1));
            data.push_back(r(2,0));
            data.push_back(r(2,1));
            data.push_back(r(2,2));
            data.push_back(tvec.at<double>(2));
            data.push_back(0);
            data.push_back(0);
            data.push_back(0);
            data.push_back(1);
            Mat origin2cam = Mat(data,true).reshape(1,4);

            Mat cam2origin = origin2cam.inv();

            // DEBUG Generate the location of the camera
            vector<double> data2;
            data2.push_back(0);
            data2.push_back(0);
            data2.push_back(0);
            data2.push_back(1);
            Mat genout = Mat(data2,true).reshape(1,4);
            Mat camcoords = cam2origin * genout;

            printf("%zu :: filler :: % 3.3f % 3.3f % 3.3f\n", i,
                    camcoords.at<double>(0,0), camcoords.at<double>(1,0), camcoords.at<double>(2,0));

//            if (key == 'w') {
                printf("written to camera %zu\n",i);
                std::ofstream fout;
                fout.open(std::to_string(device_ids[i]) + ".calib", std::ofstream::out);
                fout << "camera_matrix =";
                for (int r = 0; r < device_camera_matrix[i].rows; r++) {
                    for (int c = 0; c < device_camera_matrix[i].cols; c++) {
                        fout << " " << device_camera_matrix[i].at<double>(r, c);
                    }
                }
                fout << std::endl;
                fout << "dist_coeffs =";
                for (int r = 0; r < device_dist_coeffs[i].rows; r++) {
                    for (int c = 0; c < device_dist_coeffs[i].cols; c++) {
                        fout << " " << device_dist_coeffs[i].at<double>(r, c);
                    }
                }
                fout << std::endl;
                fout << "transform_matrix =";
                for (int r = 0; r < cam2origin.rows; r++) {
                    for (int c = 0; c < cam2origin.cols; c++) {
                        fout << " " << cam2origin.at<double>(r, c);
                    }
                }
                fout << std::endl;
                fout.close();
  //          }


            zarray_destroy(detections);

            imshow(std::to_string(i), frame);
        }

        key = waitKey(16);
    }
}
