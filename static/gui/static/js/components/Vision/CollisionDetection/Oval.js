// Function to check the point
export const isPointInOval = (point, oval) =>
{
    const h = oval["x"];//oval center x
    const k = oval["y"];//oval center y
    const a = oval["radius"];//oval radius x direction
    const b = oval["radiusY"];//oval radius y direction

    const x = point[0];//point x coordinate
    const y = point[1];//point y coordinate
    // checking the equation of
    // oval with the given point
    var p = (((x - h)*(x - h)) / (a*a))
            + (((y - k)*(y - k)) / (b*b));
 
    return p <= 1;
}

export const doOvalAndCircleOverlap = (oval, circle) => {
    throw new Error("Not Implemented");
}

export const doOvalsOverlap = (oval, circle) => {
    throw new Error("Not Implemented");
}