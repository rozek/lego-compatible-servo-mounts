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
const ServoHornThickness    =  1.5
const ServoHornStartWidth   =  6.2 /*  7.5 */ + 2*Epsilon
const ServoHornEndWidth     =  4.2 /*  4.6 */ + 2*Epsilon
const ServoHornLength       = 16.2 /* 18.0 */ + 2*Epsilon
const ServoHornAxisDiameter =  7.5, ServoHornAxisRadius = ServoHornAxisDiameter/2 + Epsilon
const ServoHornAxisOffset   =  6.5            // more a guess than a measurement

const ScrewDiameter = 2.0, ScrewRadius = ScrewDiameter/2
const NutThickness  = 2.0

const Angle90  = 90  * Math.PI/180
const Angle180 = 180 * Math.PI/180
const Angle270 = 270 * Math.PI/180

const main = () => {
  let Horn = union(
    extrudeLinear({ height:ServoHornThickness },
      polygon({
        points:[
          [ServoHornStartWidth/2,0],
          [ServoHornEndWidth/2,ServoHornLength-ServoHornEndWidth/2],
          [-ServoHornEndWidth/2,ServoHornLength-ServoHornEndWidth/2],
          [-ServoHornStartWidth/2,0]
        ]
      })
    ), cylinder({
      radius:ServoHornEndWidth/2, height:ServoHornThickness,
      center:[ 0,ServoHornLength-ServoHornEndWidth/2,ServoHornThickness/2 ]
    })
  )
  Horn = rotateX( Angle90,Horn )

  let leftArm = translate([ 0,Thickness/2,ServoBodyWidth/2 ],
    rotateX(Angle90,
      subtract(
        union(
          cylinder({ radius:ServoBodyWidth/2, height:Thickness }),
          cuboid({
            size:[ ServoBodyLength,ServoBodyWidth,Thickness ],
            center:[ ServoBodyLength/2,0,0 ]
          })
        ),
        cylinder({ radius:ServoHornAxisRadius, height:Thickness + Epsilon })
      )
    )
  )
  leftArm = subtract(
    leftArm,
    translate([ 0,ServoHornThickness-0.5,ServoBodyWidth/2 ], Horn ),
    translate([ 0,ServoHornThickness-0.5,ServoBodyWidth/2 ], rotateY( Angle90,Horn )),
    translate([ 0,ServoHornThickness-0.5,ServoBodyWidth/2 ], rotateY( Angle180,Horn )),
    translate([ 0,ServoHornThickness-0.5,ServoBodyWidth/2 ], rotateY( Angle270,Horn ))
  )

  const middleArmLength = ServoBodyHeight + NutThickness + 2*Thickness + 3.0

  let middleArm = cuboid({
    size:[ Thickness,middleArmLength,ServoBodyWidth ],
    center:[ -Thickness/2+ServoBodyLength,middleArmLength/2,ServoBodyWidth/2 ]
  })
    let BoreholeCount = Math.floor((middleArmLength-2*Thickness)/BoreholeOffset)

    for (let i = 0; i < BoreholeCount; i++) {
      middleArm = subtract(
        middleArm, translate(
          [ -Thickness/2+ServoBodyLength,(i+0.5)*BoreholeOffset+Thickness,ServoBodyWidth/2 ],
          rotateY(
            Angle90, cylinder({ radius:BoreholeRadius+Epsilon, height:Thickness })
          )
        )
      )
    }

  let rightArm = translate([ 0,middleArmLength,ServoBodyWidth/2 ],
    rotateX(Angle90,
      subtract(
        union(
          cylinder({ radius:ServoBodyWidth/2, height:Thickness }),
          cuboid({
            size:[ ServoBodyLength,ServoBodyWidth,Thickness ],
            center:[ ServoBodyLength/2,0,0 ]
          }),
        ),
        cylinder({ radius:BoreholeRadius+Epsilon, height:Thickness })
      )
    )
  )

  return union(
    leftArm, middleArm, rightArm
  )
}

module.exports = { main }
