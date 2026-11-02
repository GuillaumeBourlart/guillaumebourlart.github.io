// Server-side encounter director. More friends bring more targets, not faster unavoidable damage.
const lerp=(a,b,t)=>a+(b-a)*t;
const curve=(t,points)=>{for(let i=1;i<points.length;i++)if(t<points[i][0])return lerp(points[i-1][1],points[i][1],(t-points[i-1][0])/(points[i][0]-points[i-1][0]));return points.at(-1)[1];};
export function cooperativePacing(seconds,players=1){
  const n=Math.max(1,Math.min(4,Math.floor(players))),t=Math.max(0,Number(seconds)||0),minutes=t/60;
  return{
    players:n,spawnRate:curve(t,[[0,.75],[30,1.15],[60,1.8],[120,2.45],[180,3.3],[360,5.0],[600,6.8],[900,8.6]])*(1+.55*(n-1)),
    maxEnemies:120+20*(n-1),openingSlimes:5+2*(n-1),hpMultiplier:1+.4*(n-1),bossHpMultiplier:1+.65*(n-1),xpDivisor:1+.30*(n-1),
    hpGrowth:1+minutes*.17+Math.pow(minutes,1.4)*.05,damageGrowth:1+Math.min(1.2,minutes*.075),speedGrowth:Math.min(.3,minutes*.025),
    eliteAt:150,enemyGates:{slime:0,runner:25,wisp:50,spitter:75,brute:115},
    speeds:{slime:5.1,runner:6.0,wisp:5.5,spitter:4.5,brute:4.0,boss:3.25},projectilesPerPlayer:Math.max(100,160-15*(n-1))
  };
}
