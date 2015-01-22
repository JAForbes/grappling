con = can.getContext('2d')

screenSetup = function(){
	E('Screen').each(function(screen){
		screen.can.width = screen.width
		screen.can.height = screen.height
		screen.con.translate(screen.width*screen.translateX,screen.height * screen.translateY)
	})
}
draw = function(o){
	E('Drawable').each(function(drawable,e){
		var o = E('Location',e)
		var d = E('Dimensions',e)
		con.fillRect(o.x-d.w/2,o.y-d.h/2,d.w,d.h)
	})
}
gravity = function(o){
	E('GravityAffected').each(function(g,e){
		var v = E('Velocity',e)
		var p = E('Location',e)
		v.y = _.min([g.value+v.y,g.max])
	})
}
move = function(o){
	E('Velocity').each(function(v,e){
		var o = E('Location',e)
		o.x += v.x
		o.y += v.y
	})
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
Φ = function(me,you){
	var Δy = you.y - me.y;
	var Δx = you.x - me.x;
	me.r = Math.sqrt(Δy*Δy + Δx*Δx)
	//me.Φ = Math.atan2(Δy,Δx)
	me.Φrad = Math.atan2(Δy,Δx)
	me.Φdeg = me.Φrad * 180 / Math.PI
	var outerLimit = Math.PI //[radians]
	var bPol = 1 //Base Polarity
	if (-Math.PI/2 <= me.Φrad && me.Φrad < Math.PI/2) {
		me.θrad = me.Φrad
		bPol	= -1//basePolarity
	}else{
		if (me.Φrad < 0) {
			outerLimit = outerLimit *-1
		}
		me.θrad = outerLimit - me.Φrad
		
	};

	me.θdeg = me.Φrad * 180 / Math.PI

	me.sinθ = Math.sin(me.θrad)
	me.cosθ = Math.cos(me.θrad)


	me.bPol = bPol
	me.b0 = me.r * me.cosθ * me.bPol
	me.h0 = me.r * me.sinθ *-1
	me.bTest = Math.round(me.x) == Math.round(me.b0)
	me.hTest = Math.round(me.y) == Math.round(me.h0)
	var g = 0.005
	me.wn = gravity * Math.sin(me.θrad)
	var v = Math.sqrt(me.vy*me.vy + me.vx*me.vx)
}

grapplingHook = function(){
	E('GrapplingHookConnection').each(function(connection,e){
		
		
		var g = E('GravityAffected',e).value
		var anchor = E('Location',connection.anchor)
		var pendulum = E('Location',e)
		
		var Δy = anchor.y - pendulum.y;
		var Δx = anchor.x - pendulum.x;
		var r = Math.sqrt(Δy*Δy + Δx*Δx)
		var Φ_rod_rad = Math.atan2(Δy,Δx)
		var θ_rod_rad = Φ_rod_rad
		var outerLimit = Math.PI //[radians]
		var bPol = -1 //Base Polarity
		var radLimit  = Math.PI/2
		//Get θ_rod_ from Φ_rod_ and translate computer angle system to mathematical model
		if (-radLimit > Φ_rod_rad || Φ_rod_rad >= radLimit) {
			bPol = 1//basePolarity
			if (Φ_rod_rad < 0) {
				outerLimit = outerLimit *-1
			}
			θ_rod_rad = outerLimit - Φ_rod_rad
		}
		
		var sinθ_rod = Math.sin(θ_rod_rad)
		var cosθ_rod = Math.cos(θ_rod_rad)
		
		var velocity = E('Velocity',e)
		//Pendulum Velocity Details
		var vx = velocity.x
		var vy = velocity.y
		var v = Math.sqrt(vy*vy + vx*vx)
		var vθ_rad = Math.atan2(vy,vx)
		var vθ_deg = vθ_rad * 180 / Math.PI
		
		//Tensile Force components
		//velocity weight due to gravity projected on axis of velocity-anchor axis
		var Wr = g * Math.sin(θ_rod_rad)
		
		//Radial Acceleration used to compute Tension
		var ρ = (v*v/r)
		
		//Rod Elasticity
		//Stiffness of rod
		var k = 0.0001
		
		//Natural length of velocity-anchor rod.
		//Hard coded for now.
		//In future set to desired rod length or
		//Set to length between velocity & anchor when 1st connected.
		var r0 = 150.5
		
		var elasticity = (r-r0)*k	//Rod elasticity tension component
		
		//Acceleration Calculation
		var ax = (Wr - ρ - elasticity) * cosθ_rod * bPol
		var ay = (Wr - ρ - elasticity) * sinθ_rod * -1
		
		velocity.θ = θ_rod_rad * 180 / Math.PI
		//Apply Acceleration to & publish velocity properties
		velocity.y = velocity.y+ay
		velocity.x = velocity.x+ax
		// pendulum.v = v
		// pendulum.vθ = vθ_deg
		
		pendulum.r = r
		
		//Damping Component
		//pendulum velocity component along rod axis
		var Δvy = anchor.y - velocity.y;
		var Δvx = anchor.x - velocity.x;
		var r = Math.sqrt(Δy*Δy + Δx*Δx)
		var Φ_rod_rad = Math.atan2(Δy,Δx)
		var vr = v * Math.cos(-θ_rod_rad)
		
	})
}


drawState = function(o){
	E('StateDrawable').each(function(drawable,e){
		var i = 0;
		var spacing = 15;
		
		
		var o = E('Location',e)
		var d = E('Dimensions',e)
		
		con.font = '10pt Helvetica'
		for(var j = 0; j < drawable.include.length; j++ ){
			var componentName = drawable.include[j];
			var component = E(componentName,e)
			
			
			for(key in component){
				var val = component[key]
				con.fillText([componentName.slice(0,drawable.summarise),'.',key,':',val].join(''),o.x+d.w, o.y + d.h + i * spacing)
				i++
			}
			i++
		}
	
	})
}

reset = function () {
	E.components = {}
	var game = E({
		Paused: { value: false },
		Screen: {
			width: can.width,
			height: can.height,
			translateX: 0.5,
			translateY: 0.5,
			can: can,
			con: con
		}
	})
	var mouse = E({
		Location: { x:0, y:0 },
		Velocity: { x:0 ,y:0 },
		Dimensions: {w:5, h: 5},
		MouseTrackable: {},
		Drawable: {},
		ΦAble: {}
	})
	var block = E({
		Location: { x:0, y:0 },
		Velocity: { x:0, y:0 },
		Dimensions: {w:10, h:10},
		Length: { value: 5},
		Drawable: {}
	})
	var person = E({
		Location: { x:10, y:-200 },
		Velocity: { x:0, y:0 },
		Dimensions: {w:5, h:5},
		Drawable: {},
		GravityAffected: { value:	0.005, max: 4 },
		StateDrawable: {
			summarise: 1,
			include: ['Location','Velocity','Dimensions','GravityAffected']
		},
		GrapplingHookConnection : {
			anchor: block,
			initial_distance: 200
		}
	})
	
}



togglePause = function(){
	E('Paused').each(function(paused,e){
		paused.value = !paused.value
	})
}

window.onkeydown = function(e){
	var action = ({
		P: togglePause,
		R: reset
	})[String.fromCharCode(e.keyCode)]
	action && action();
}

;(function(){
	var _m = {x: 0, y: 0}
	window.onclick = function(e){
		_m.x = e.clientX - can.width/2
		_m.y = (e.clientY) - can.height/2
	}
	

	mouseUpdate = function(o){
		E('MouseTrackable').each(function(trackable,e){
			var o = E('Location',e)
			o.x = _m.x;
			o.y = _m.y;
		})
	}
}())


engine = function(){

	
	grapplingHook()
	gravity()
	mouseUpdate()
	move()
	//Φable.map(function(o){
	//	Φ(o,block)
	//})
}

loop = function(){
	!E('Paused').sample().value && engine()
	screenSetup()
	draw()
	drawState()
}
reset()

setInterval(loop,0)	//0 is instant, 1000 is to do it once a second

