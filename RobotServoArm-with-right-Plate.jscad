const { cuboid, cylinder, cylinderElliptic }   = require('@jscad/modeling').primitives
const { translate, rotateX, rotateY, rotateZ } = require('@jscad/modeling').transforms
const { union, subtract }                      = require('@jscad/modeling').booleans
const { polygon }                              = require('@jscad/modeling').primitives
const { extrudeLinear }                        = require('@jscad/modeling').extrusions

const Epsilon = 0.1                      // a small extra for imprecise printers

const Thickness = 2.0

const BoreholeDiameter = 3.0, BoreholeRadius = BoreholeDiameter/2
const BoreholeOffset   = 8.0
const BoreholeDistance = BoreholeOffset - BoreholeDiameter
const BoreholeSpace    = BoreholeDistance/2

const ServoBodyWidth        = 13.0               // a bit larger than in reality
const ServoBodyLength       = 23.0                                       // dto.
const ServoBodyHeight       = 27.0                                       // dto.
const ServoFlangeOffset     = 15.6                                       // dto.
const ServoFlangeThickness  =  2.5 + Epsilon
const ServoFlangeLength     =  5.0 + Epsilon
const ServoScrewOffset      =  2.0
const ServoHornThickness    =  1.8
const ServoHornStartWidth   =  6.2 /*  7.5 */ + 2*Epsilon
const ServoHornEndWidth     =  4.2 /*  4.6 */ + 2*Epsilon
const ServoHornLength       = 16.2 /* 18.0 */ + 2*Epsilon
const ServoHornAxisDiameter =  7.5, ServoHornAxisRadius = ServoHornAxisDiameter/2 + Epsilon

const ScrewDiameter = 2.0, ScrewRadius = ScrewDiameter/2
const NutDiameter   = 6.0, NutRadius   = NutDiameter/2
const NutThickness  = 3.0

const Angle90  = 90  * Math.PI/180
const Angle180 = 180 * Math.PI/180
const Angle270 = 270 * Math.PI/180

const main = () => {
  let Horn = union(
    extrudeLinear({ height:ServoHornThickness+2*Epsilon },
      polygon({
        points:[
          [ServoHornStartWidth/2,0],
          [ServoHornEndWidth/2,ServoHornLength-ServoHornEndWidth/2],
          [-ServoHornEndWidth/2,ServoHornLength-ServoHornEndWidth/2],
          [-ServoHornStartWidth/2,0]
        ]
      })
    ), cylinder({
      radius:ServoHornEndWidth/2, height:ServoHornThickness+2*Epsilon,
      center:[ 0,ServoHornLength-ServoHornEndWidth/2,ServoHornThickness/2+Epsilon ]
    })
  )
  Horn = rotateX( Angle90,Horn )

  let leftArm = translate([ 0,Thickness/2,ServoBodyWidth/2 ],
    rotateX(Angle90,
      subtract(
        union(
          cylinder({
            radius:ServoBodyWidth/2, height:2*Thickness,
            center:[ 0,0,-Thickness/2 ]
          }),
          cuboid({
            size:[ ServoBodyLength,ServoBodyWidth,Thickness ],
            center:[ ServoBodyLength/2,0,0 ]
          })
        ),
        cylinder({ radius:ServoHornAxisRadius+Epsilon, height:4*Thickness })
      )
    )
  )
  leftArm = subtract(
    leftArm,
    translate([ 0,ServoHornThickness,ServoBodyWidth/2 ], Horn ),
    translate([ 0,ServoHornThickness,ServoBodyWidth/2 ], rotateY( Angle90,Horn )),
    translate([ 0,ServoHornThickness,ServoBodyWidth/2 ], rotateY( Angle180,Horn )),
    translate([ 0,ServoHornThickness,ServoBodyWidth/2 ], rotateY( Angle270,Horn ))
  )

  const middleArmLength = ServoBodyHeight + 4*Thickness + NutThickness + 3*Epsilon

  let middleArm = cuboid({
    size:[ Thickness,middleArmLength,ServoBodyWidth+BoreholeOffset ],
    center:[ -Thickness/2+ServoBodyLength,middleArmLength/2,ServoBodyWidth/2-BoreholeOffset/2 ]
  })
    let BoreholeCount = Math.floor((middleArmLength-2*Thickness)/BoreholeOffset)
    let firstOffset   = (middleArmLength-(BoreholeCount-1)*BoreholeOffset)/2

    for (let i = 0; i < BoreholeCount; i++) {
      middleArm = subtract(
        middleArm,
        translate(
          [ -Thickness/2+ServoBodyLength,firstOffset+i*BoreholeOffset,ServoBodyWidth/2 ],
          rotateY(
            Angle90, cylinder({ radius:BoreholeRadius+Epsilon, height:Thickness })
          )
        ),
        translate(
          [ -Thickness/2+ServoBodyLength,firstOffset+i*BoreholeOffset,ServoBodyWidth/2-BoreholeOffset ],
          rotateY(
            Angle90, cylinder({ radius:BoreholeRadius+Epsilon, height:Thickness })
          )
        )
      )
    }

  let rightArm = translate([ 0,middleArmLength-Thickness/2,ServoBodyWidth/2 ],
    rotateX(Angle90,
      subtract(
        union(
          cylinder({ radius:ServoBodyWidth/2, height:Thickness }),
          cuboid({
            size:[ ServoBodyLength,ServoBodyWidth,Thickness ],
            center:[ ServoBodyLength/2,0,0 ]
          }),
        ),
        cylinder({ radius:BoreholeRadius+Epsilon, height:2*Thickness })
      )
    )
  )

  return union(
    leftArm, middleArm, rightArm
  )
}

module.exports = { main }
