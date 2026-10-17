export const homeCopy=[
 {headline:'Wear a little art.',description:'Original garden art, painted by hand on your everyday tee.'},
 {headline:'Let your tee bloom.',description:'A little colour. A little character. A tee made for you.'},
 {headline:'Painted for you.',description:'Find your favourite painting and wear it your way.'},
 {headline:'An everyday canvas.',description:'Hand-painted Tees with a story in every brushstroke.'},
 {headline:'A garden to wear.',description:'Flowers, roots and new beginnings, reimagined on a tee.'}
];
export function nextCopyIndex(previous,length=homeCopy.length){return Number.isInteger(previous)&&previous>=0&&previous<length?(previous+1)%length:0;}
