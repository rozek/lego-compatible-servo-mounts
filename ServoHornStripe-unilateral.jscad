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

const StripeWidth  = 10.0
const StripeLength = 80.0
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
  const CornerXOffset = StripeWidth/2
  const CornerYOffset = StripeLength/2

  let Stripe = union(
    subtract(
      cuboid({ size:[ StripeWidth,StripeLength,Thickness-2*Epsilon ] }), // main body

    /**** make room for rounded corners ****/

      cuboid({ size:[ CornerRadius,CornerRadius,Thickness ], center:[ -CornerXOffset+CornerRadius/2,-CornerYOffset+CornerRadius/2,0 ] }),
      cuboid({ size:[ CornerRadius,CornerRadius,Thickness ], center:[ -CornerXOffset+CornerRadius/2, CornerYOffset-CornerRadius/2,0 ] }),
      cuboid({ size:[ CornerRadius,CornerRadius,Thickness ], center:[  CornerXOffset-CornerRadius/2,-CornerYOffset+CornerRadius/2,0 ] }),
      cuboid({ size:[ CornerRadius,CornerRadius,Thickness ], center:[  CornerXOffset-CornerRadius/2, CornerYOffset-CornerRadius/2,0 ] }),
    ),

  /**** add rounded corners ****/

    cylinder({
      radius:CornerRadius, height:Thickness-2*Epsilon,
      center:[ -CornerXOffset+CornerRadius,-CornerYOffset+CornerRadius,0 ]
    }),
    cylinder({
      radius:CornerRadius, height:Thickness-2*Epsilon,
      center:[ -CornerXOffset+CornerRadius, CornerYOffset-CornerRadius,0 ]
    }),
    cylinder({
      radius:CornerRadius, height:Thickness-2*Epsilon,
      center:[  CornerXOffset-CornerRadius,-CornerYOffset+CornerRadius,0 ]
    }),
    cylinder({
      radius:CornerRadius, height:Thickness-2*Epsilon,
      center:[  CornerXOffset-CornerRadius, CornerYOffset-CornerRadius,0 ]
    })
  )

/**** add holes to the stripe ****/

  let HoleCount = Math.floor(StripeLength/BoreholeOffset)

  for (let i = 0, l = HoleCount; i < l; i++) {
    Stripe = subtract(Stripe, translate(
      [ 0,(i-(HoleCount-1)/2)*BoreholeOffset,0 ],
      cylinder({ radius:BoreholeRadius+Epsilon, height:Thickness })
    ))
  }

  Stripe = translate([ 0,StripeLength/2-StripeWidth/2,Thickness/2 ], Stripe)


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

  let Cross = union(
    Horn, rotateZ( Angle90,Horn ), rotateZ( Angle180,Horn ), rotateZ( Angle270,Horn ),
    cylinder({ radius:ServoHornAxisRadius+Epsilon, height:Thickness })
  )
  Cross = translate([ 0,0,Thickness-ServoHornThickness ], Cross)

  return subtract(Stripe, Cross)
}

module.exports = { main }
