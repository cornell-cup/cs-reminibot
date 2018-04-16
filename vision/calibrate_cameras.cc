#include <iostream>
#include <fstream>
#include <opencv2/opencv.hpp>
#include <stdio.h>
#include <stdlib.h>
#include <vector>

using namespace cv;
using std::vector;

int main(int argc, char** argv) {
    // Display usage
    if (argc < 5) {
        printf("Usage: %s <rows> <cols> <size> [cameras...]\n", argv[0]);
        return -1;
    }

    // Parse arguments
    int rows = atoi(argv[1]);
    int cols = atoi(argv[2]);
    float size = atof(argv[3]);

    // Open video capture devices
    vector<VideoCapture> devices;
    vector<int> device_ids;
    vector<vector<vector<Point2f>>> img_points;
    vector<vector<vector<Point3f>>> obj_points;
    for (int i = 4; i < argc; i++) {
        int id = atoi(argv[i]);
        VideoCapture device(id);
        if (device.isOpened()) {
            device.set(CV_CAP_PROP_FRAME_WIDTH, 1280);
            device.set(CV_CAP_PROP_FRAME_HEIGHT, 720);
            device.set(CV_CAP_PROP_FPS, 30);
            img_points.push_back(vector<vector<Point2f>>());
            obj_points.push_back(vector<vector<Point3f>>());
            devices.push_back(device);
            device_ids.push_back(id);
        }
        else {
            std::cerr << "Failed to open video capture device " << id << std::endl;
        }
    }

    // Calibration variables
    Size checkerboard_size(rows, cols);
    vector<Point3f> checkerboard_points;
    for (int j = 0; j < cols; j++) {
        for (int i = 0; i < rows; i++) {
            checkerboard_points.push_back(Point3f(i * size, j * size, 0.f));
        }
    }

    int key = 0;
    Mat frame, gray;
    vector<Point2f> corners;
    while (key != 27) { // Quit on escape keypress
        for (size_t i = 0; i < devices.size(); i++) {
            if (!devices[i].isOpened()) {
                continue;
            }

            devices[i] >> frame;

            // Detect checkerboards on spacebar
            if (waitKey(1) == 32) {
                cvtColor(frame, gray, COLOR_BGR2GRAY);
                bool found = findChessboardCorners(gray, checkerboard_size, corners,
                        CALIB_CB_ADAPTIVE_THRESH + CALIB_CB_NORMALIZE_IMAGE + CALIB_CB_FAST_CHECK);
                if (found) {
                    std::cout << "Found checkerboard on " << i << std::endl;
                    img_points[i].push_back(corners);
                    obj_points[i].push_back(checkerboard_points);
                    cornerSubPix(gray, corners, Size(11, 11), Size(-1, -1),
                            TermCriteria(CV_TERMCRIT_EPS + CV_TERMCRIT_ITER, 30, 0.1));
                }
                drawChessboardCorners(frame, checkerboard_size, Mat(corners), found);
            }

            imshow(std::to_string(i), frame);
        }

        key = waitKey(16);
        if (key == 'w') { // Write calibration to text files
            Mat camera_matrix;
            Mat dist_coeffs;
            vector<Mat> rvecs;
            vector<Mat> tvecs;
            for (size_t i = 0; i < devices.size(); i++) {
                if (!devices[i].isOpened()) {
                    continue;
                }
                if (obj_points[i].size() == 0) {
                    std::cout << "No checkerboards detected on camera " << device_ids[i] << std::endl;
                    continue;
                }

                // TODO Check if calibration already exists first

                std::cout << "Calibrate camera " << device_ids[i] << std::endl;
                calibrateCamera(obj_points[i], img_points[i], frame.size(), camera_matrix,
                        dist_coeffs, rvecs, tvecs);

                std::cout << "Write calibration" << std::endl;
                std::ofstream fout;
                fout.open(std::to_string(device_ids[i]) + ".calib");
                fout << "camera_matrix =";
                for (int r = 0; r < camera_matrix.rows; r++) {
                    for (int c = 0; c < camera_matrix.cols; c++) {
                        fout << " " << camera_matrix.at<double>(r, c);
                    }
                }
                fout << std::endl;
                fout << "dist_coeffs =";
                for (int r = 0; r < dist_coeffs.rows; r++) {
                    for (int c = 0; c < dist_coeffs.cols; c++) {
                        fout << " " << dist_coeffs.at<double>(r, c);
                    }
                }
                fout << std::endl;
                fout.close();

                std::cout << "Write calibration output to " << device_ids[i] << ".calib" << std:: endl;
            }
        }
    }
}