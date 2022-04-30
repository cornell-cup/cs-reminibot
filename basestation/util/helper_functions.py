import math
def distance(x1, y1, x2, y2):
    return math.sqrt((x2-x1)**2 + (y2-y1)**2)


# Python3 program to implement
# the above approach
 
# Utility function to find cross product
# of two vectors
def CrossProduct(A):
     
    # Stores coefficient of X
    # direction of vector A[1]A[0]
    X1 = (A[1][0] - A[0][0])
 
    # Stores coefficient of Y
    # direction of vector A[1]A[0]
    Y1 = (A[1][1] - A[0][1])
 
    # Stores coefficient of X
    # direction of vector A[2]A[0]
    X2 = (A[2][0] - A[0][0])
 
    # Stores coefficient of Y
    # direction of vector A[2]A[0]
    Y2 = (A[2][1] - A[0][1])
 
    # Return cross product
    return (X1 * Y2 - Y1 * X2)
 
# Function to check if the polygon is
# convex polygon or not
def isConvex(points):
     
    # Stores count of
    # edges in polygon
    N = len(points)
 
    # Stores direction of cross product
    # of previous traversed edges
    prev = 0
 
    # Stores direction of cross product
    # of current traversed edges
    curr = 0
 
    # Traverse the array
    for i in range(N):
         
        # Stores three adjacent edges
        # of the polygon
        temp = [points[i], points[(i + 1) % N],
                           points[(i + 2) % N]]
 
        # Update curr
        curr = CrossProduct(temp)
 
        # If curr is not equal to 0
        if (curr != 0):
             
            # If direction of cross product of
            # all adjacent edges are not same
            if (curr * prev < 0):
                return False
            else:
                 
                # Update curr
                prev = curr
 
    return True