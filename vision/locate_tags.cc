#include <apriltag/apriltag.h>
#include <apriltag/tag36h11.h>
#include <apriltag/tag36artoolkit.h>
#include <curl/curl.h>
#include <iostream>
#include <fstream>
#include <opencv2/opencv.hpp>
#include <stdio.h>
#include <stdlib.h>
#include <vector>
#include <cmath>
#define _USE_MATH_DEFINES
#include <math.h>

using namespace cv;
using std::vector;

#define TAG_SIZE 6.5f

int main(int argc, char **argv)
{
    // Display usage

    if (argc < 3)
    {
        printf("Usage: %s <basestation url> [cameras...]\n", argv[0]);
        return -1;
    }
    // // Parse arguments
    // CURL *curl;
    // curl = curl_easy_init();
    // if (!curl) {
    //     std::cerr << "Failed to initialize curl" << std::endl;
    //     return -1;
    // }
    // curl_easy_setopt(curl, CURLOPT_URL, argv[1]);
    // curl_easy_setopt(curl, CURLOPT_TIMEOUT_MS, 200L);

    vector<VideoCapture> devices;
    vector<int> device_ids;
    vector<Mat> device_camera_matrix;
    vector<Mat> device_dist_coeffs;
    vector<Mat> device_transform_matrix;
    //std::cout << "Loop 1 Start";
    for (int i = 2; i < argc; i++)
    {
        int id = atoi(argv[i]);
        VideoCapture device(id);
        if (!device.isOpened())
        {
            std::cerr << "Failed to open video capture device " << id << std::endl;
            continue;
        }
        std::ifstream fin;
        fin.open(argv[i]);
        if (fin.fail())
        {
            std::cerr << "Failed to open file " << argv[i] << std::endl;
            continue;
        }
        Mat camera_matrix, dist_coeffs, transform_matrix;
        std::string line;
        // TODO Error checking
        //std::cout << "Inner while loop start";
        while (std::getline(fin, line))
        {
            std::stringstream line_stream(line);
            std::string key, equals;
            line_stream >> key >> equals;
            if (key == "camera_matrix")
            {
                vector<double> data;
                for (int i = 0; i < 9; i++)
                {
                    double v;
                    line_stream >> v;
                    data.push_back(v);
                }
                camera_matrix = Mat(data, true).reshape(1, 3);
            }
            else if (key == "dist_coeffs")
            {
                vector<double> data;
                for (int i = 0; i < 5; i++)
                {
                    double v;
                    line_stream >> v;
                    data.push_back(v);
                }
                dist_coeffs = Mat(data, true).reshape(1, 1);
            }
            else if (key == "transform_matrix")
            {
                vector<double> data;
                for (int i = 0; i < 16; i++)
                {
                    double v;
                    line_stream >> v;
                    data.push_back(v);
                }
                transform_matrix = Mat(data, true).reshape(1, 4);
            }
            else
            {
                std::cerr << "Unrecognized key '" << key << "' in file " << argv[i] << std::endl;
            }
        }
        //std::cout <<"inner while loop end";
        if (camera_matrix.rows != 3 || camera_matrix.cols != 3)
        {
            std::cerr << "Error reading camera_matrix in file " << argv[i] << std::endl;
            continue;
        }

        if (dist_coeffs.rows != 1 || dist_coeffs.cols != 5)
        {
            std::cerr << "Error reading dist_coeffs in file " << argv[i] << std::endl;
            continue;
        }

        if (transform_matrix.rows != 4 || transform_matrix.cols != 4)
        {
            std::cerr << "Error reading transform_matrix in file " << argv[i] << std::endl;
            continue;
        }

        device.set(CV_CAP_PROP_FRAME_WIDTH, 1280);
        device.set(CV_CAP_PROP_FRAME_HEIGHT, 720);
        device.set(CV_CAP_PROP_FPS, 30);
        devices.push_back(device);
        device_ids.push_back(id);
        device_camera_matrix.push_back(camera_matrix);
        device_dist_coeffs.push_back(dist_coeffs);
        device_transform_matrix.push_back(transform_matrix);
    }
    //std::cout <<"for loop 1 closed";
    // Initialize detector
    apriltag_family_t *tf = tag36h11_create();
    tf->black_border = 1;
    apriltag_detector_t *td = apriltag_detector_create();
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
    char postDataBuffer[100];
    //std::cout<< "while loop 2 start";
    while (key != 27)
    { // Quit on escape keypres
        // if(key == 'w'){
        //std::cout <<"for loop 2 start";
        //std::cout << "Print numbr of devices: " << devices.size() << "\n" ;
        for (size_t i = 0; i < devices.size(); i++)
        {
            if (!devices[i].isOpened())
            {
                std::cout << "Not opened\n";
                continue;
            }

            devices[i] >> frame;
            cvtColor(frame, gray, COLOR_BGR2GRAY);
            image_u8_t im = {
                .width = gray.cols,
                .height = gray.rows,
                .stride = gray.cols,
                .buf = gray.data};

            zarray_t *detections = apriltag_detector_detect(td, &im);

            vector<Point2f> img_points(4);
            vector<Point3f> obj_points(4);
            Mat rvec(3, 1, CV_64FC1);
            Mat tvec(3, 1, CV_64FC1);
            //std::cout << "for loop 3 start\n";
            // std::cout << "Size of detections: " << zarray_size(detections) << "\n";
            for (int j = 0; j < zarray_size(detections); j++)
            {
                // std::cout <<"J is " << j << "\n";
                // Get the ith detection
                apriltag_detection_t *det;
                zarray_get(detections, j, &det);

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
                img_points[0] = Point2f(det->p[0][0], det->p[0][1]);
                img_points[1] = Point2f(det->p[1][0], det->p[1][1]);
                img_points[2] = Point2f(det->p[2][0], det->p[2][1]);
                img_points[3] = Point2f(det->p[3][0], det->p[3][1]);

                obj_points[0] = Point3f(-TAG_SIZE * 0.5f, -TAG_SIZE * 0.5f, 0.f);
                obj_points[1] = Point3f(TAG_SIZE * 0.5f, -TAG_SIZE * 0.5f, 0.f);
                obj_points[2] = Point3f(TAG_SIZE * 0.5f, TAG_SIZE * 0.5f, 0.f);
                obj_points[3] = Point3f(-TAG_SIZE * 0.5f, TAG_SIZE * 0.5f, 0.f);

                solvePnP(obj_points, img_points, device_camera_matrix[i],
                         device_dist_coeffs[i], rvec, tvec);
                Matx33d r;
                Rodrigues(rvec, r);

                vector<double> data;
                data.push_back(r(0, 0));
                data.push_back(r(0, 1));
                data.push_back(r(0, 2));
                data.push_back(tvec.at<double>(0));
                data.push_back(r(1, 0));
                data.push_back(r(1, 1));
                data.push_back(r(1, 2));
                data.push_back(tvec.at<double>(1));
                data.push_back(r(2, 0));
                data.push_back(r(2, 1));
                data.push_back(r(2, 2));
                data.push_back(tvec.at<double>(2));
                data.push_back(0);
                data.push_back(0);
                data.push_back(0);
                data.push_back(1);
                Mat tag2cam = Mat(data, true).reshape(1, 4);

                vector<double> data2;
                data2.push_back(0);
                data2.push_back(0);
                data2.push_back(0);
                data2.push_back(1);
                Mat genout = Mat(data2, true).reshape(1, 4);

                Mat tag2orig = device_transform_matrix[i] * tag2cam;
                Mat tagXYZS = tag2orig * genout;

                // char key;
                // std::cin >> key;
                double sin = tag2orig.at<double>(0, 1);
                double cos = tag2orig.at<double>(0, 0);
                double angle = acos(cos);
                if (sin < 0)
                {
                    angle = 2 * M_PI - angle;
                }
                angle = angle * 180 / M_PI;
                //std::cout << "w if sTART";
                char keypress;
                std::cin >> keypress;

                printf("%zu :: %d :: % 3.3f % 3.3f % 3.3f % 3.3f\n",
                       i, det->id,
                       tagXYZS.at<double>(0), tagXYZS.at<double>(1), tagXYZS.at<double>(2), angle);
                //if (key == 'w')
                //{
                //    printf("%zu :: %d :: % 3.3f % 3.3f % 3.3f % 3.3f\n",
                //           i, det->id,
                //           tagXYZS.at<double>(0), tagXYZS.at<double>(1), tagXYZS.at<double>(2), angle);
                //}
                // Send data to basestation
                sprintf(postDataBuffer, "{\"id\":%d,\"x\":%f,\"y\":%f,\"z\":%f}",
                        det->id, tagXYZS.at<double>(0), tagXYZS.at<double>(1), tagXYZS.at<double>(2));
                // curl_easy_setopt(curl, CURLOPT_POSTFIELDS, postDataBuffer);
                // // TODO Check for error response
                // curl_easy_perform(curl);
            }
            // std::cout << "For loop 3 closed";

            zarray_destroy(detections);

            //imshow(std::to_string(i), frame);
        }
        // std::cout <<"for loop 2 closed";
        // }

        key = waitKey(16);
    }
    // std::cout <<"while loop 2 closed";
    // curl_easy_cleanup(curl);
}
