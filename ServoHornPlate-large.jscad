const { cuboid, cylinder, cylinderElliptic }   = require('@jscad/modeling').primitives
const { translate, rotateX, rotateY, rotateZ } = require('@jscad/modeling').transforms
const { union, subtract }                      = require('@jscad/modeling').booleans
const { polygon }                              = require('@jscad/modeling').primitives
const { extrudeLinear }                        = require('@jscad/modeling').extrusions

const Epsilon = 0.1                      // a small extra for imprecise printers

const Thickness = 4.0                          // i.e., twice as thick as normal

const BoreholeDiameter = 3.0, BoreholeRadius = BoreholeDiameter/2
const BoreholeOffset   = 8.0
const BoreholeDistance = BoreholeOffset - BoreholeDiameter
const BoreholeSpace    = BoreholeDistance/2

const PlateWidth   = 40.0
const CornerRadius = 2.0

const ServoHornThickness    =  1.8
const ServoHornStartWidth   =  6.2 /*  7.5 */ + 2*Epsilon
const ServoHornEndWidth     =  4.2 /*  4.6 */ + 2*Epsilon
const ServoHornLength       = 16.2 /* 18.0 */ + 2*Epsilon
const ServoHornAxisDiameter =  7.5, ServoHornAxisRadius = ServoHornAxisDiameter/2 + Epsilon

const Angle90  = 90  * Math.PI/180
const Angle180 = 180 * Math.PI/180
const Angle270 = 270 * Math.PI/180

const main = () => {
  const CornerOffset = PlateWidth/2

  let Plate = union(
    subtract(
      cuboid({ size:[ PlateWidth,PlateWidth,Thickness-2*Epsilon ] }), // main body

    /**** make room for rounded corners ****/

      cuboid({ size:[ CornerRadius,CornerRadius,Thickness ], center:[ -CornerOffset+CornerRadius/2,-CornerOffset+CornerRadius/2,0 ] }),
      cuboid({ size:[ CornerRadius,CornerRadius,Thickness ], center:[ -CornerOffset+CornerRadius/2, CornerOffset-CornerRadius/2,0 ] }),
      cuboid({ size:[ CornerRadius,CornerRadius,Thickness ], center:[  CornerOffset-CornerRadius/2,-CornerOffset+CornerRadius/2,0 ] }),
      cuboid({ size:[ CornerRadius,CornerRadius,Thickness ], center:[  CornerOffset-CornerRadius/2, CornerOffset-CornerRadius/2,0 ] }),
    ),

  /**** add rounded corners ****/

    cylinder({
      radius:CornerRadius, height:Thickness-2*Epsilon,
      center:[ -CornerOffset+CornerRadius,-CornerOffset+CornerRadius,0 ]
    }),
    cylinder({
      radius:CornerRadius, height:Thickness-2*Epsilon,
      center:[ -CornerOffset+CornerRadius, CornerOffset-CornerRadius,0 ]
    }),
    cylinder({
      radius:CornerRadius, height:Thickness-2*Epsilon,
      center:[  CornerOffset-CornerRadius,-CornerOffset+CornerRadius,0 ]
    }),
    cylinder({
      radius:CornerRadius, height:Thickness-2*Epsilon,
      center:[  CornerOffset-CornerRadius, CornerOffset-CornerRadius,0 ]
    })
  )

/**** add holes to the stripe ****/

  let HoleCounts = Math.floor(PlateWidth/BoreholeOffset)

  for (let i = 0, l = HoleCounts; i < l; i++) {
    for (let j = 0, k = HoleCounts; j < k; j++) {
      Plate = subtract(Plate, translate(
        [ (i-(HoleCounts-1)/2)*BoreholeOffset,(j-(HoleCounts-1)/2)*BoreholeOffset,0 ],
        cylinder({ radius:BoreholeRadius+Epsilon, height:Thickness })
      ))
    }
  }

  Plate = translate([ 0,0,Thickness/2 ], Plate)


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

  let Cross = union(
    Horn, rotateZ( Angle90,Horn ), rotateZ( Angle180,Horn ), rotateZ( Angle270,Horn ),
    cylinder({ radius:ServoHornAxisRadius+Epsilon, height:Thickness+2*Epsilon })
  )
  Cross = translate([ 0,0,Thickness-ServoHornThickness ], Cross)

  return subtract(Plate, Cross)
}

module.exports = { main }
