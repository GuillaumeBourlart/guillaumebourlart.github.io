import * as THREE from '../vendor/three.module.js';

// Combine only direct, static siblings. Animated groups keep their own transforms.
export function batchStaticChildren(parent){
  const buckets=new Map();
  for(const child of parent.children){
    if(!child.isMesh||Array.isArray(child.material)||child.children.length||!child.geometry?.attributes.normal)continue;
    let bucket=buckets.get(child.material);if(!bucket){bucket=[];buckets.set(child.material,bucket);}bucket.push(child);
  }
  for(const[material,children]of buckets){
    if(children.length<2)continue;
    const positions=[],normals=[],uvs=[];
    for(const child of children){
      child.updateMatrix();const copy=child.geometry.index?child.geometry.toNonIndexed():child.geometry.clone();copy.applyMatrix4(child.matrix);
      const p=copy.attributes.position,n=copy.attributes.normal,uv=copy.attributes.uv;
      for(let i=0;i<p.count;i++){positions.push(p.getX(i),p.getY(i),p.getZ(i));normals.push(n.getX(i),n.getY(i),n.getZ(i));uvs.push(uv?.getX(i)||0,uv?.getY(i)||0);}
      copy.dispose();parent.remove(child);if(child.userData.uniqueGeometry)child.geometry.dispose();
    }
    const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));geometry.computeBoundingSphere();
    const merged=new THREE.Mesh(geometry,material);merged.name='static-decoration-batch';merged.userData.uniqueGeometry=true;parent.add(merged);
  }
}
