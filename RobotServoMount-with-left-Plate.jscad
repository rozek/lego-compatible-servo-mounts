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

const ServoBodyWidth       = 13.0                // a bit larger than in reality
const ServoBodyLength      = 23.0                                        // dto.
const ServoBodyHeight      = 27.0                                        // dto.
const ServoFlangeOffset    = 15.6                                        // dto.
const ServoFlangeThickness =  2.5 + Epsilon
const ServoFlangeLength    =  5.0 + Epsilon
const ServoScrewOffset     =  2.0
const ServoHornAxisOffset  =  6.0             // more a guess than a measurement

const ScrewDiameter = 2.0, ScrewRadius = ScrewDiameter/2
const NutThickness  = 3.0

const Angle90  = 90  * Math.PI/180
const Angle180 = 180 * Math.PI/180
const Angle270 = 270 * Math.PI/180

const main = () => {
  let Flange = subtract(                 // servo should be mounted from the top
    cuboid({
      size:[ ServoFlangeLength, Thickness, ServoBodyWidth ]
    }),
    rotateX( Angle90, cylinder({ radius:ScrewRadius, height:Thickness+1.0 }) )
  )

  let leftFlange = translate([
    -ServoFlangeLength/2, Thickness/2, ServoBodyWidth/2
  ], Flange)

  let rightFlange = translate([
    ServoFlangeLength/2+ServoBodyLength, Thickness/2, ServoBodyWidth/2
  ], Flange)


  const BracketLength = ServoFlangeOffset + Thickness + NutThickness
                                    // gives room for a nut underneath the servo
  let Bracket = cuboid({ size:[ Thickness,BracketLength,ServoBodyWidth ] })
    let BoreholeCount = Math.floor((BracketLength-2*Thickness)/BoreholeOffset)

    for (let i = 0; i < BoreholeCount; i++) {
      Bracket = subtract(
        Bracket, translate(
          [ 0,(i-(BoreholeCount-1)/2)*BoreholeOffset,0 ],
          rotateY(
            Angle90, cylinder({ radius:BoreholeRadius+Epsilon, height:Thickness })
          )
        )
      )
    }
  Bracket = translate([0,BracketLength/2,ServoBodyWidth/2],Bracket)

  let leftBracket  = translate([ -0.5*Thickness-ServoFlangeLength,0,0 ], Bracket)
  let rightBracket = translate([ 0.5*Thickness+ServoFlangeLength+ServoBodyLength,0,0 ], Bracket)


  const BaseLength = ServoBodyLength+2*ServoFlangeLength

  let Base = subtract(
    cuboid({
      size:  [ BaseLength, Thickness, ServoBodyWidth ],
      center:[ ServoBodyLength/2, BracketLength-Thickness/2, ServoBodyWidth/2 ]
    }),
    translate([ ServoBodyLength/2+ServoFlangeLength,ServoFlangeOffset+NutThickness+Thickness/2,ServoBodyWidth/2 ],
      rotateX(Angle90,
        cylinder({ radius:BoreholeRadius+Epsilon, height:Thickness+Epsilon })
      )
    )
  )

  let ServoMount = union(
    leftFlange,  leftBracket,
    rightFlange, rightBracket,
    Base
  )

/**** lateral plate is added below ****/

  ServoMount = translate([ 0,0,NutThickness+Thickness ], ServoMount)

  let lateralPlate = cuboid({
    size:  [ BaseLength+2*Thickness,BracketLength,Thickness ],
    center:[ ServoBodyLength/2,BracketLength/2,0 ]
  })
    let BoreholeCounts = [
      Math.floor(BaseLength/BoreholeOffset),
      Math.floor((BracketLength-Thickness)/BoreholeOffset)
    ]

    for (let i = 0, l = BoreholeCounts[0]; i < l; i++) {
      for (let j = 0, k = BoreholeCounts[1]; j < k; j++) {
        lateralPlate = subtract(lateralPlate, translate(
          [ i*BoreholeOffset,(j+0.5)*BoreholeOffset+Thickness,0 ],
          cylinder({ radius:BoreholeRadius+Epsilon, height:Thickness })
        ))
      }
    }
  lateralPlate = translate([ 0,0,Thickness/2 ],lateralPlate)

  lateralPlate = union(
    lateralPlate,
    cuboid({                                                 // flange extension
      size:  [ ServoFlangeLength, Thickness, NutThickness ],
      center:[ -ServoFlangeLength/2,Thickness/2,NutThickness/2+Thickness ]
    }),
    cuboid({                                                 // flange extension
      size:  [ ServoFlangeLength, Thickness, NutThickness ],
      center:[ ServoFlangeLength/2+ServoBodyLength,Thickness/2,NutThickness/2+Thickness ]
    }),

    cuboid({                                                // bracket extension
      size:  [ Thickness, BracketLength, NutThickness ],
      center:[ -0.5*Thickness-ServoFlangeLength,BracketLength/2,NutThickness/2+Thickness ]
    }),
    cuboid({                                                // bracket extension
      size:  [ Thickness, BracketLength, NutThickness ],
      center:[ 0.5*Thickness+ServoFlangeLength+ServoBodyLength,BracketLength/2,NutThickness/2+Thickness ]
    }),

    cuboid({                                                   // base extension
      size:  [ BaseLength, Thickness, NutThickness ],
      center:[ ServoBodyLength/2, BracketLength-Thickness/2,NutThickness/2+Thickness ]
    }),
  )

  return union(ServoMount,lateralPlate)
}

module.exports = { main }
