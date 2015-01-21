con = can.getContext('2d')

entities = []
block = {x:0, y:-50, w:20, h:20, vx:0, vy:0, length: 5}
person = { x:-50, y:50, w:20, h:20, vx:1, vy: 0}

screenSetup = function(){
	can.width = can.width
	con.translate(can.width/2,can.height/2)
}
draw = function(o){
	con.fillRect(o.x-o.w/2,o.y-o.h/2,o.w,o.h)
}
gravity = function(o){
	var g = 0.05;
	var gMax = 4;
	o.vy = _.min([g+o.vy,gMax])
}
move = function(o){
	o.x += o.vx
	o.y += o.vy
}
face = function(a,b){
	return Math.atan2(b.y - a.y, b.x - a.x);
}
toward = function(a,b){
	var r = face(a,b);
	
	return {
		x: Math.cos(r) * 3,
		y: Math.sin(r) * 3
	}
}
squared = _.partialRight(Math.pow,2)
distance = function(a,b){
	var sq = squared
	return Math.sqrt(
		sq(b.x-a.x) +
		sq(b.y-a.y)
	)
}
grapplingHook = function(pendula,anchor){
	
	
}
drawable = [block,person]
gravityAffected = [person]
moveable = [person]

loop = function(){
	screenSetup()
	drawable.map(draw)
	gravityAffected.map(gravity)
	grapplingHook(person,block)
	moveable.map(move)
	requestAnimationFrame(loop)
}
loop()

