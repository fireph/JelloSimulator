"use strict";

var JSIM = {};

JSIM.Simulator = function(gravity) {
    this.gravity = gravity || new THREE.Vector3(0,-9.8,0);
    this.springMeshes = [];
    this.planes = [];
};

JSIM.Simulator.prototype.addSpringMesh = function(obj) {
    this.springMeshes.push(obj);
};

JSIM.Simulator.prototype.addPlane = function(obj) {
    this.planes.push(obj);
};

JSIM.Simulator.prototype.update = function(tdelta) {
    var i;
    for (i = 0; i < this.springMeshes.length; i++) {
        this.springMeshes[i].calcGravity(this.gravity, tdelta);
    }
    for (i = 0; i < this.springMeshes.length; i++) {
        this.springMeshes[i].calcInfluence(this.planes, tdelta);
    }
};

JSIM.SpringMesh = function() {
    this.nodes = [];
    this.spheres = [];
};

JSIM.SpringMesh.prototype.addNode = function(i, j, k, node) {
    if (!this.nodes[i]) {
        this.nodes[i] = [];
    }
    if (!this.nodes[i][j]) {
        this.nodes[i][j] = [];
    }
    this.nodes[i][j][k] = node;
    var sphere = new THREE.Sphere(node.position, 30);
    this.spheres.push(sphere);
};

JSIM.SpringMesh.prototype.calcGravity = function(gravity, tdelta) {
    var node;
    for (var i = 0; i < this.nodes.length; i++) {
        for (var j = 0; j < this.nodes[i].length; j++) {
            for (var k = 0; k < this.nodes[i][j].length; k++) {
                node = this.nodes[i][j][k];
                node.receiveInfluence(gravity.clone().multiplyScalar(node.mass), tdelta);
            }
        }
    }
};

JSIM.SpringMesh.prototype.calcInfluence = function(planes, tdelta) {
    var node;

    //calc for each corner
    for (var i = 0; i < this.nodes.length; i++) {
        for (var j = 0; j < this.nodes[i].length; j++) {
            for (var k = 0; k < this.nodes[i][j].length; k++) {
                node = this.nodes[i][j][k];
                node.sendInfluence(tdelta);
            }
        }
    }
    for (var i = this.nodes.length-1; i > -1; i--) {
        for (var j = 0; j < this.nodes[i].length; j++) {
            for (var k = 0; k < this.nodes[i][j].length; k++) {
                node = this.nodes[i][j][k];
                node.sendInfluence(tdelta);
            }
        }
    }
    for (var i = 0; i < this.nodes.length; i++) {
        for (var j = this.nodes[i].length-1; j > -1; j--) {
            for (var k = 0; k < this.nodes[i][j].length; k++) {
                node = this.nodes[i][j][k];
                node.sendInfluence(tdelta);
            }
        }
    }
    for (var i = this.nodes.length-1; i > -1; i--) {
        for (var j = this.nodes[i].length-1; j > -1; j--) {
            for (var k = 0; k < this.nodes[i][j].length; k++) {
                node = this.nodes[i][j][k];
                node.sendInfluence(tdelta);
            }
        }
    }

    for (var i = 0; i < this.nodes.length; i++) {
        for (var j = 0; j < this.nodes[i].length; j++) {
            for (var k = this.nodes[i][j].length-1; k > -1; k--) {
                node = this.nodes[i][j][k];
                node.sendInfluence(tdelta);
            }
        }
    }
    for (var i = this.nodes.length-1; i > -1; i--) {
        for (var j = 0; j < this.nodes[i].length; j++) {
            for (var k = this.nodes[i][j].length-1; k > -1; k--) {
                node = this.nodes[i][j][k];
                node.sendInfluence(tdelta);
            }
        }
    }
    for (var i = 0; i < this.nodes.length; i++) {
        for (var j = this.nodes[i].length-1; j > -1; j--) {
            for (var k = this.nodes[i][j].length-1; k > -1; k--) {
                node = this.nodes[i][j][k];
                node.sendInfluence(tdelta);
            }
        }
    }
    for (var i = this.nodes.length-1; i > -1; i--) {
        for (var j = this.nodes[i].length-1; j > -1; j--) {
            for (var k = this.nodes[i][j].length-1; k > -1; k--) {
                node = this.nodes[i][j][k];
                node.sendInfluence(tdelta);
            }
        }
    }

    for (var i = 0; i < this.nodes.length; i++) {
        for (var j = 0; j < this.nodes[i].length; j++) {
            for (var k = 0; k < this.nodes[i][j].length; k++) {
                node = this.nodes[i][j][k];
                for (var n = 0; n < planes.length; n++) {
                    var ret = planes[n].nodeBelow(node);
                    if (ret.status) {
                        node.position.copy(ret.proj);
                        node.velocityVec.set(0,0,0);
                    }
                }
            }
        }
    }
};

JSIM.Cube = function(xSize, ySize, zSize, xNodes, yNodes, zNodes, x, y, z, obj) {
    JSIM.SpringMesh.call(this);
    var geometry = new THREE.Geometry();
    var kLinearSpring = 1;
    var kAngleSpring = 5;
    var nodesDict = {};
    var startX = x - xSize/2;
    var startY = y - ySize/2;
    var startZ = z - zSize/2;
    var diffX = xSize/(xNodes-1);
    var diffY = ySize/(yNodes-1);
    var diffZ = zSize/(zNodes-1);
    var i, j, k, node;
    for (i = 0; i < xNodes; i++) {
        var currentX = startX + i*diffX;
        for (j = 0; j < yNodes; j++) {
            var currentY = startY + j*diffY;
            for (k = 0; k < zNodes; k++) {
                var currentZ = startZ + k*diffZ;
                var position = new THREE.Vector3(currentX, currentY, currentZ);
                node = new JSIM.SpringNode(position, 1);
                this.addNode(i, j, k, node);
                nodesDict[i+"_"+j+"_"+k] = node;
                currentZ += diffZ;
            }
            currentY += diffY;
        }
        currentX += diffX;
    }
    for (i = 0; i < xNodes; i++) {
        for (j = 0; j < yNodes; j++) {
            for (k = 0; k < zNodes; k++) {
                node = nodesDict[i+"_"+j+"_"+k];
                var linearSpring;
                var linearSprings = {};
                if (i > 0) { // -x
                    linearSpring = new JSIM.LinearSpring(node, nodesDict[(i-1)+"_"+j+"_"+k], diffX, kLinearSpring);
                    node.addSpring(linearSpring);
                    linearSprings['-x'] = linearSpring;
                }
                if (i < xNodes-1) { //+x
                    linearSpring = new JSIM.LinearSpring(node, nodesDict[(i+1)+"_"+j+"_"+k], diffX, kLinearSpring);
                    node.addSpring(linearSpring);
                    linearSprings['+x'] = linearSpring;
                }
                if (j > 0) { //-y
                    linearSpring = new JSIM.LinearSpring(node, nodesDict[i+"_"+(j-1)+"_"+k], diffY, kLinearSpring);
                    node.addSpring(linearSpring);
                    linearSprings['-y'] = linearSpring;
                }
                if (j < yNodes-1) { //+y
                    linearSpring = new JSIM.LinearSpring(node, nodesDict[i+"_"+(j+1)+"_"+k], diffY, kLinearSpring);
                    node.addSpring(linearSpring);
                    linearSprings['+y'] = linearSpring;
                }
                if (k > 0) { //-z
                    linearSpring = new JSIM.LinearSpring(node, nodesDict[i+"_"+j+"_"+(k-1)], diffZ, kLinearSpring);
                    node.addSpring(linearSpring);
                    linearSprings['-z'] = linearSpring;
                }
                if (k < xNodes-1) { //+z
                    linearSpring = new JSIM.LinearSpring(node, nodesDict[i+"_"+j+"_"+(k+1)], diffZ, kLinearSpring);
                    node.addSpring(linearSpring);
                    linearSprings['+z'] = linearSpring;
                }

                // Cross bracing springs
                if (i > 0 && j > 0 && k > 0) {
                    linearSpring = new JSIM.LinearSpring(node, nodesDict[(i-1)+"_"+(j-1)+"_"+(k-1)], Math.sqrt(diffX*diffX + diffY*diffY + diffZ*diffZ), kLinearSpring);
                    node.addSpring(linearSpring);
                }
                if (i < xNodes-1 && j < yNodes-1 && k < zNodes-1) {
                    linearSpring = new JSIM.LinearSpring(node, nodesDict[(i+1)+"_"+(j+1)+"_"+(k+1)], Math.sqrt(diffX*diffX + diffY*diffY + diffZ*diffZ), kLinearSpring);
                    node.addSpring(linearSpring);
                }
                if (i > 0 && j < yNodes-1 && k < zNodes-1) {
                    linearSpring = new JSIM.LinearSpring(node, nodesDict[(i-1)+"_"+(j+1)+"_"+(k+1)], Math.sqrt(diffX*diffX + diffY*diffY + diffZ*diffZ), kLinearSpring);
                    node.addSpring(linearSpring);
                }
                if (i > 0 && j > 0 && k < zNodes-1) {
                    linearSpring = new JSIM.LinearSpring(node, nodesDict[(i-1)+"_"+(j-1)+"_"+(k+1)], Math.sqrt(diffX*diffX + diffY*diffY + diffZ*diffZ), kLinearSpring);
                    node.addSpring(linearSpring);
                }
                if (i < xNodes-1 && j > 0 && k < zNodes-1) {
                    linearSpring = new JSIM.LinearSpring(node, nodesDict[(i+1)+"_"+(j-1)+"_"+(k+1)], Math.sqrt(diffX*diffX + diffY*diffY + diffZ*diffZ), kLinearSpring);
                    node.addSpring(linearSpring);
                }

                var paths = [
                    ['-x', '+y', '+x', '-y'],
                    ['-x', '+z', '+x', '-z'],
                    ['-z', '+y', '+z', '-y']
                ];
                var angleSpring;
                for (var n = 0; n < paths.length; n++) {
                    for (var m = 0; m < paths[n].length-1; m++) {
                        var s1 = linearSprings[paths[n][m]];
                        var s2 = linearSprings[paths[n][m+1]];
                        if (s1 && s2) {
                            angleSpring = new JSIM.AngleSpring(node, s1.node2, s2.node2, Math.PI/2, kAngleSpring);
                            node.addSpring(angleSpring);
                        }
                    }
                }
            }
        }
    }
    var p1, p2, p3, p4;
    //left
    i = 0;
    for (j = 0; j < yNodes-1; j++) {
        for (k = 0; k < zNodes-1; k++) {
            var l = geometry.vertices.length;
            p1 = nodesDict[i+"_"+j+"_"+k].position;
            p2 = nodesDict[i+"_"+(j+1)+"_"+k].position;
            p3 = nodesDict[i+"_"+(j+1)+"_"+(k+1)].position;
            p4 = nodesDict[i+"_"+j+"_"+(k+1)].position;
            geometry.vertices.push(p1);
            geometry.vertices.push(p2);
            geometry.vertices.push(p3);
            geometry.vertices.push(p4);
            geometry.faces.push(new THREE.Face3(l, l+1, l+2));
            geometry.faces.push(new THREE.Face3(l, l+2, l+3));
        }
    }
    //right
    i = xNodes-1;
    for (j = 0; j < yNodes-1; j++) {
        for (k = 0; k < zNodes-1; k++) {
            var l = geometry.vertices.length;
            p1 = nodesDict[i+"_"+j+"_"+k].position;
            p2 = nodesDict[i+"_"+(j+1)+"_"+k].position;
            p3 = nodesDict[i+"_"+(j+1)+"_"+(k+1)].position;
            p4 = nodesDict[i+"_"+j+"_"+(k+1)].position;
            geometry.vertices.push(p1);
            geometry.vertices.push(p2);
            geometry.vertices.push(p3);
            geometry.vertices.push(p4);
            geometry.faces.push(new THREE.Face3(l, l+1, l+2));
            geometry.faces.push(new THREE.Face3(l, l+2, l+3));
        }
    }
    //bottom
    j = 0;
    for (i = 0; i < xNodes-1; i++) {
        for (k = 0; k < zNodes-1; k++) {
            var l = geometry.vertices.length;
            p1 = nodesDict[i+"_"+j+"_"+k].position;
            p2 = nodesDict[(i+1)+"_"+j+"_"+k].position;
            p3 = nodesDict[(i+1)+"_"+j+"_"+(k+1)].position;
            p4 = nodesDict[i+"_"+j+"_"+(k+1)].position;
            geometry.vertices.push(p1);
            geometry.vertices.push(p2);
            geometry.vertices.push(p3);
            geometry.vertices.push(p4);
            geometry.faces.push(new THREE.Face3(l, l+1, l+2));
            geometry.faces.push(new THREE.Face3(l, l+2, l+3));
        }
    }
    //top
    j = yNodes-1;
    for (i = 0; i < xNodes-1; i++) {
        for (k = 0; k < zNodes-1; k++) {
            var l = geometry.vertices.length;
            p1 = nodesDict[i+"_"+j+"_"+k].position;
            p2 = nodesDict[(i+1)+"_"+j+"_"+k].position;
            p3 = nodesDict[(i+1)+"_"+j+"_"+(k+1)].position;
            p4 = nodesDict[i+"_"+j+"_"+(k+1)].position;
            geometry.vertices.push(p1);
            geometry.vertices.push(p2);
            geometry.vertices.push(p3);
            geometry.vertices.push(p4);
            geometry.faces.push(new THREE.Face3(l, l+1, l+2));
            geometry.faces.push(new THREE.Face3(l, l+2, l+3));
        }
    }
    //back
    k = 0;
    for (i = 0; i < xNodes-1; i++) {
        for (j = 0; j < yNodes-1; j++) {
            var l = geometry.vertices.length;
            p1 = nodesDict[i+"_"+j+"_"+k].position;
            p2 = nodesDict[i+"_"+(j+1)+"_"+k].position;
            p3 = nodesDict[(i+1)+"_"+(j+1)+"_"+k].position;
            p4 = nodesDict[(i+1)+"_"+j+"_"+k].position;
            geometry.vertices.push(p1);
            geometry.vertices.push(p2);
            geometry.vertices.push(p3);
            geometry.vertices.push(p4);
            geometry.faces.push(new THREE.Face3(l, l+1, l+2));
            geometry.faces.push(new THREE.Face3(l, l+2, l+3));
        }
    }
    //front
    k = zNodes-1;
    for (i = 0; i < xNodes-1; i++) {
        for (j = 0; j < yNodes-1; j++) {
            var l = geometry.vertices.length;
            p1 = nodesDict[i+"_"+j+"_"+k].position;
            p2 = nodesDict[i+"_"+(j+1)+"_"+k].position;
            p3 = nodesDict[(i+1)+"_"+(j+1)+"_"+k].position;
            p4 = nodesDict[(i+1)+"_"+j+"_"+k].position;
            geometry.vertices.push(p1);
            geometry.vertices.push(p2);
            geometry.vertices.push(p3);
            geometry.vertices.push(p4);
            geometry.faces.push(new THREE.Face3(l, l+1, l+2));
            geometry.faces.push(new THREE.Face3(l, l+2, l+3));
        }
    }
    nodesDict[0+"_"+0+"_"+0].position.x -= 30;
    nodesDict[0+"_"+0+"_"+0].position.y -= 30;
    nodesDict[0+"_"+0+"_"+0].position.z -= 30;
    geometry.computeCentroids();
    geometry.computeFaceNormals();
    obj.add(new THREE.Mesh(geometry, new THREE.MeshNormalMaterial({side: THREE.DoubleSide, shading: THREE.FlatShading, opacity: 0.7, transparent: true})));
    //obj.add(new THREE.Line(geometry, new THREE.LineBasicMaterial({color: 0xff0000}), THREE.LinePieces));
};

JSIM.Cube.prototype = new JSIM.SpringMesh();

JSIM.SpringNode = function(position, mass) {
    this.velocityVec = new THREE.Vector3(0,0,0);
    this.position = position;
    this.mass = mass;
    this.linearSprings = [];
    this.angleSprings = [];
};

JSIM.SpringNode.prototype.addSpring = function(spring) {
    if (spring instanceof JSIM.LinearSpring) {
        this.linearSprings.push(spring);
    } else if (spring instanceof JSIM.AngleSpring) {
        this.angleSprings.push(spring);
    }
};

JSIM.SpringNode.prototype.updatePosition = function(posDiff) {
    this.position.add(posDiff);
};

JSIM.SpringNode.prototype.receiveInfluence = function(forceVec, tdelta, override) {
    var c = 0.08;
    if (override) {
        c = 0.0;
    }
    var realForce = forceVec.sub(this.velocityVec.clone().multiplyScalar(c));
    var aVec = realForce.clone().multiplyScalar(1/this.mass);
    var posDiff = this.velocityVec.clone().multiplyScalar(tdelta).add(aVec.clone().multiplyScalar(0.5 * tdelta * tdelta));
    var vDiff = aVec.clone().multiplyScalar(tdelta);
    this.updatePosition(posDiff);
    this.velocityVec.add(vDiff);
};

JSIM.SpringNode.prototype.sendInfluence = function(tdelta) {
    var spring;
    for (var i = 0; i < this.linearSprings.length; i++) {
        spring = this.linearSprings[i];
        spring.calcForce(tdelta);
    }
    for (var i = 0; i < this.angleSprings.length; i++) {
        spring = this.angleSprings[i];
        spring.calcForce(tdelta);
    }
};

JSIM.LinearSpring = function(node1, node2, length, k) {
    this.node1 = node1;
    this.node2 = node2;
    this.length = length;
    this.k = k;
};

JSIM.LinearSpring.prototype.calcForce = function(tdelta) {
    var dir = this.node2.position.clone().sub(this.node1.position).normalize();
    var newLength = this.node2.position.clone().sub(this.node1.position).length();
    var lenDiff = this.length - newLength;
    var force = lenDiff * this.k;
    this.node2.receiveInfluence(dir.multiplyScalar(force), tdelta);
};

JSIM.AngleSpring = function(cNode, node1, node2, angle, k) {
    this.cNode = cNode;
    this.node1 = node1;
    this.node2 = node2;
    this.angle = angle;
    this.k = k;
};

JSIM.AngleSpring.prototype.calcForce = function(tdelta) {
    var v1 = this.node1.position.clone().sub(this.cNode.position).normalize();
    var v2 = this.node2.position.clone().sub(this.cNode.position).normalize();
    var normal = v1.clone().cross(v2).normalize();
    var vDiff = v2.clone().sub(v1).normalize();
    var c = vDiff.clone().cross(normal).normalize();
    var normC = c.clone().cross(vDiff).normalize();
    var moveV1 = normC.clone().cross(v1.clone().negate()).normalize();
    var moveV2 = normC.clone().cross(v2).normalize();
    var angle = Math.acos(v1.dot(v2)/(v1.dot(v1)*v2.dot(v2)));
    if (angle > this.angle) {
        var negMoveV1 = moveV1.negate();
        var negMoveV2 = moveV2.negate();
        this.node1.receiveInfluence(negMoveV1.multiplyScalar((angle - this.angle)*this.k), tdelta);
        this.node2.receiveInfluence(negMoveV2.multiplyScalar((angle - this.angle)*this.k), tdelta);
    } else {
        this.node1.receiveInfluence(moveV1.multiplyScalar((this.angle - angle)*this.k), tdelta);
        this.node2.receiveInfluence(moveV2.multiplyScalar((this.angle - angle)*this.k), tdelta);
    }
};

JSIM.Plane = function(position, normal) {
    this.plane = new THREE.Plane();
    this.position = position || new THREE.Vector3(0,0,0);
    this.normal = normal || new THREE.Vector3(0,1,0);
    this.plane.setFromNormalAndCoplanarPoint(this.normal, this.position);
    this.threeObj = new THREE.Mesh(new THREE.PlaneGeometry(2000, 2000, 30, 30), new THREE.MeshBasicMaterial({color: 0xff0000, wireframe: true, side: THREE.DoubleSide}));
    this.threeObj.lookAt(this.normal);
};

JSIM.Plane.prototype.nodeBelow = function(node) {
    var projPoint = this.plane.projectPoint(node.position);
    var nodeVec = node.position.clone().sub(projPoint).normalize();
    return {status: nodeVec.sub(this.normal).length() > 0.01, proj: projPoint};
};