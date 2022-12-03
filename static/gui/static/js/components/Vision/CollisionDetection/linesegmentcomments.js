//Pa = P1 + Ua*(P2-P1) = lineSegment1[0] + Ua*(lineSegment1[1]-lineSegment1[0])
//Pb = P3 + Ua*(P4-P3) = lineSegment2[0] + Ua*(lineSegment2[1]-lineSegment2[0])
/*
    
        x1 = lineSegment1[0][0]
        y1 = lineSegment1[0][1]

        x2 = lineSegment1[1][0]
        y2 = lineSegment1[1][1]

        x3 = lineSegment2[0][0]
        y3 = lineSegment2[0][1]

        x4 = lineSegment2[1][0]
        y4 = lineSegment2[1][1]
    
    */

//Ua = ((x4-x3)*(y1-y3)-(y4-y3)*(x1-x3))/((y4-y3)*(x2-x1)-(x4-x3)*(y2-y1))
//Ub = ((x2-x1)*(y1-y3)-(y2-y1)*(x1-x3))/((y4-y3)*(x2-x1)-(x4-x3)*(y2-y1))
