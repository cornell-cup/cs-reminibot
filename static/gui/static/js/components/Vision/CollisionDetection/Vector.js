export default class Vector extends Array {}

export const scaleVector = (scaleFactor, v) => {
  return v.map((element) => scaleFactor * element)
}

export const negateVector = (v) => {
  return scaleVector(-1, v)
}

export const addVectors = (v1, v2) => {
  if (v1.length == v2.length) {
    return v1.map((element, index) => element + v2[index])
  } else {
    throwUnequalLengthsError(v1, v2)
  }
}

export const subtractVectors = (v1, v2) => {
  return addVectors(v1, negateVector(v2))
}

export const dotProduct = (v1, v2) => {
  if (v1.length == v2.length) {
    return v1.reduce((total, currentElement, currentIndex) => total + currentElement * v2[currentIndex])
  } else {
    throwUnequalLengthsError(v1, v2)
  }
}

//returns the z component of the cross product
export const zCrossProduct = (v1, v2) => {
  if (v1.length != v2.length) {
    throwUnequalLengthsError(v1, v2)
  } else if (v1.length < 2) {
    throwVectorTooSmallError(2)
  } else {
    //v1.X*v2.Y-v1.Y*v2.X
    return v1[0] * v2[1] - v1[1] * v2[0]
  }
}

export const slope = (v1, v2) => {
  if (v1.length != v2.length) {
    throwUnequalLengthsError(v1, v2)
  } else if (v1.length < 2) {
    throwVectorTooSmallError(2)
  } else {
    //(v2.Y-v1.Y)/(v2.X-v1.X)
    return (v2[1] - v1[1]) / (v2[0] - v1[0])
  }
}

const throwUnequalLengthsError = (v1, v2) => {
  throw new Error(`Vector lengths must be equal. This vector's length: ${v1.length}. Other vector's length: ${v2.length}.`)
}

const throwVectorTooSmallError = (minimumLength) => {
  throw new Error(`Vector(s) length(s) must be at least ${minimumLength} for this function.`)
}
