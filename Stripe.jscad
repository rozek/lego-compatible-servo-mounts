const { cuboid, cylinder, cylinderElliptic }   = require('@jscad/modeling').primitives
const { translate, rotateX, rotateY, rotateZ } = require('@jscad/modeling').transforms
const { union, subtract }                      = require('@jscad/modeling').booleans

const Epsilon = 0.1                      // a small extra for imprecise printers

const Thickness = 2.0

const BoreholeDiameter = 3.0, BoreholeRadius = BoreholeDiameter/2
const BoreholeOffset   = 8.0
const BoreholeDistance = BoreholeOffset - BoreholeDiameter
const BoreholeSpace    = BoreholeDistance/2

const HoleCounts = [ 5,7 ]

const StripeWidth  = (HoleCounts[0]-1) * BoreholeOffset + 2*BoreholeRadius + 2*BoreholeSpace - 2*Epsilon
const StripeLength = (HoleCounts[1]-1) * BoreholeOffset + 2*BoreholeRadius + 2*BoreholeSpace - 2*Epsilon
const CornerRadius = 2.0

const main = () => {
  const CornerXOffset = StripeWidth/2
  const CornerYOffset = StripeLength/2

  let Stripe = translate([
      StripeWidth/2-BoreholeRadius-BoreholeSpace,StripeLength/2-BoreholeRadius-BoreholeSpace,0
    ],
    union(
      subtract(
        cuboid({ size:[ StripeWidth,StripeLength,Thickness-2*Epsilon ] }),    // main stripe

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
  )

/**** add holes to the stripe ****/

  for (let i = 0, l = HoleCounts[0]; i < l; i++) {
    for (let j = 0, k = HoleCounts[1]; j < k; j++) {
      Stripe = subtract(Stripe, translate(
        [ i*BoreholeOffset,j*BoreholeOffset,0 ],
        cylinder({ radius:BoreholeRadius+Epsilon, height:Thickness })
      ))
    }
  }

/**** that's it ****/

  return Stripe
}

module.exports = { main }
