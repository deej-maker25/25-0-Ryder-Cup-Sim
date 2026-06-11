import React, {useEffect, useMemo, useState} from 'react';
export default function Reel({label,items,value,color='blue',spinning}){
 const extended=useMemo(()=>Array.from({length:10}).flatMap(()=>items),[items]);
 const finalIndex=extended.length-items.length+Math.max(0,items.indexOf(value));
 const [offset,setOffset]=useState(0);
 useEffect(()=>{ if(spinning){setOffset(0); const t=setTimeout(()=>setOffset(finalIndex*44-88),80); return()=>clearTimeout(t)}},[spinning,finalIndex]);
 return <div><p className={color==='gold'?'gold':'blue'} style={{fontSize:12,fontWeight:900,letterSpacing:3,textTransform:'uppercase',textAlign:'center'}}>{label}</p><div className={`reelWindow ${color==='gold'?'goldBorder':''}`}><div className="fadeTop"/><div className="fadeBot"/><div className="reelCenter"/><div className="list" style={{transform:`translateY(${-offset}px)`}}>{extended.map((it,i)=><div className="reelItem" key={i} style={{color:i===finalIndex&&!spinning?(color==='gold'?'#c9a84c':'#60a5fa'):'rgba(255,255,255,.48)'}}>{it}</div>)}</div></div><p style={{textAlign:'center',fontSize:12,fontWeight:900}}>{spinning?'Spinning…':value}</p></div>
}
