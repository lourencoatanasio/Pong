var vertexShaderText =	
[
	'precision mediump float;',
	'',
	'attribute vec3 vertPosition;',
	'attribute vec2 vertTexCoord;',
	'varying vec2 fragTexCoord;',
	'uniform mat4 mWorld;',
	'uniform mat4 mView;',
	'uniform mat4 mProj;',
	'void main()',
	'{',
	'	fragTexCoord = vertTexCoord;',
	'	gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0);',
	'}',
].join('\n');

var fragmentShaderText =
[
	'precision mediump float;',
	'',
	'varying vec2 fragTexCoord;',
	'uniform sampler2D sampler;',
	'',
	'void main()',
	'{',
	'	gl_FragColor = texture2D(sampler, fragTexCoord);',
	'}',
].join('\n');

var init = function()
{
	const canvas = document.getElementById('canvas');
	const ctx = canvas.getContext('webgl');

	if (!ctx) 
	{
		console.log('WebGL not supported, falling back on experimental-webgl');
		ctx = canvas.getContext('experimental-webgl');
	}
	if(!ctx)
	{
		alert('Your browser does not support WebGL');
	}

	canvas.width = 900;
	canvas.height = 600;

	ctx.clearColor(0.75, 0.85, 0.8, 1.0);
	ctx.clear(ctx.COLOR_BUFFER_BIT | ctx.DEPTH_BUFFER_BIT);
	ctx.enable(ctx.DEPTH_TEST); // enable depth testing to make sure the triangles are drawn in the correct order
	ctx.enable(ctx.CULL_FACE); // enable culling to make sure the back face of the triangle is not drawn
	ctx.frontFace(ctx.CCW); // set the front face of the culling to counter clockwise 
	ctx.cullFace(ctx.BACK); // set the face to cull to the back face of the triangle

	//
	// Create shaders
	//

	var verTexShader = ctx.createShader(ctx.VERTEX_SHADER);
	var fragmentShader = ctx.createShader(ctx.FRAGMENT_SHADER);

	ctx.shaderSource(verTexShader, vertexShaderText);
	ctx.shaderSource(fragmentShader, fragmentShaderText);

	//
	// Compile shaders
	//

	ctx.compileShader(verTexShader);
	if(!ctx.getShaderParameter(verTexShader, ctx.COMPILE_STATUS)) // check if the vertex shader compiled successfully
	{
		console.error('ERROR compiling vertex shader!', ctx.getShaderInfoLog(verTexShader));
		return;
	}
	ctx.compileShader(fragmentShader);
	if(!ctx.getShaderParameter(fragmentShader, ctx.COMPILE_STATUS)) // check if the fragment shader compiled successfully
	{
		console.error('ERROR compiling fragment shader!', ctx.getShaderInfoLog(fragmentShader));
		return;
	}

	//
	// Create program and attach shaders
	//

	var program = ctx.createProgram();
	ctx.attachShader(program, verTexShader);
	ctx.attachShader(program, fragmentShader);
	ctx.linkProgram(program);
	if (!ctx.getProgramParameter(program, ctx.LINK_STATUS)) // check if the program linked successfully
	{
		console.error('ERROR linking program!', ctx.getProgramInfoLog(program));
		return;
	}
	ctx.validateProgram(program);
	if (!ctx.getProgramParameter(program, ctx.VALIDATE_STATUS)) // check if the program is valid
	{
		console.error('ERROR validating program!', ctx.getProgramInfoLog(program));
		return;
	}

	//
	// create a cube
	//

	var boxVertices = 
	[ // X, Y, Z           U, V
		// Top
		-1.0, 1.0, -1.0,   0.0, 0.0,
		-1.0, 1.0, 1.0,    0.0, 1.0,
		1.0, 1.0, 1.0,     1.0, 1.0,
		1.0, 1.0, -1.0,    1.0, 0.0,

		// Left
		-1.0, 1.0, 1.0,    0.0, 0.0,
		-1.0, -1.0, 1.0,   1.0, 0.0,
		-1.0, -1.0, -1.0,  1.0, 1.0,
		-1.0, 1.0, -1.0,   0.0, 1.0,

		// Right
		1.0, 1.0, 1.0,    1.0, 1.0,
		1.0, -1.0, 1.0,    0.0, 1.0,
		1.0, -1.0, -1.0,    0.0, 0.0,
		1.0, 1.0, -1.0,    1.0, 0.0,

		// Front
		1.0, 1.0, 1.0,    1.0, 1.0,
		1.0, -1.0, 1.0,    1.0, 0.0,
		-1.0, -1.0, 1.0,    0.0, 0.0,
		-1.0, 1.0, 1.0,    0.0, 1.0,

		// Back
		1.0, 1.0, -1.0,    0.0, 0.0,
		1.0, -1.0, -1.0,    0.0, 1.0,
		-1.0, -1.0, -1.0,    1.0, 1.0,
		-1.0, 1.0, -1.0,    1.0, 0.0,

		// Bottom
		-1.0, -1.0, -1.0,   1.0, 1.0,
		-1.0, -1.0, 1.0,    1.0, 0.0,
		1.0, -1.0, 1.0,     0.0, 0.0,
		1.0, -1.0, -1.0,    0.0, 1.0,	
	];

	var boxIndices =
	[
		// Top
		0, 1, 2,
		0, 2, 3,

		// Left
		5, 4, 6,
		6, 4, 7,

		// Right
		8, 9, 10,
		8, 10, 11,

		// Front
		13, 12, 14,
		15, 14, 12,

		// Back
		16, 17, 18,
		16, 18, 19,

		// Bottom
		21, 20, 22,
		22, 20, 23
	];


	var boxVertexBufferObject = ctx.createBuffer(); // create a buffer object for the vertices
	ctx.bindBuffer(ctx.ARRAY_BUFFER, boxVertexBufferObject);
	ctx.bufferData(ctx.ARRAY_BUFFER, new Float32Array(boxVertices), ctx.STATIC_DRAW);

	var boxIndexBufferObject = ctx.createBuffer(); // create a buffer object for the indices
	ctx.bindBuffer(ctx.ELEMENT_ARRAY_BUFFER, boxIndexBufferObject);
	ctx.bufferData(ctx.ELEMENT_ARRAY_BUFFER, new Uint16Array(boxIndices), ctx.STATIC_DRAW);

	var positionAttribLocation = ctx.getAttribLocation(program, 'vertPosition'); // get the location of the attribute variable in the program
	var texCoordAttribLocation = ctx.getAttribLocation(program, 'vertTexCoord'); // get the location of the attribute variable in the program 
	ctx.vertexAttribPointer(
		positionAttribLocation, // attribute location
		3, // number of elements per attribute
		ctx.FLOAT, // type of elements
		ctx.FALSE, // whether or not the data should be normalized
		5 * Float32Array.BYTES_PER_ELEMENT, // size of an individual vertex
		0 // offset from the beginning of a single vertex to this attribute
	);
	
	ctx.vertexAttribPointer(
		texCoordAttribLocation, // attribute location
		2, // number of elements per attribute
		ctx.FLOAT, // type of elements
		ctx.FALSE, // whether or not the data should be normalized
		5 * Float32Array.BYTES_PER_ELEMENT, // size of an individual vertex
		3 * Float32Array.BYTES_PER_ELEMENT // offset from the beginning of a single vertex to this attribute
	);

	ctx.enableVertexAttribArray(positionAttribLocation); // enable the attribute
	ctx.enableVertexAttribArray(texCoordAttribLocation); // enable the attribute

	//
	// Create texture
	//

	var boxTexture = ctx.createTexture(); // create a texture object
	ctx.bindTexture(ctx.TEXTURE_2D, boxTexture); // bind the texture to the target
	ctx.texImage2D(ctx.TEXTURE_2D, 0, ctx.RGBA, ctx.RGBA, ctx.UNSIGNED_BYTE, document.getElementById('crate-image')); // set the texture image
	ctx.pixelStorei(ctx.UNPACK_FLIP_Y_WEBGL, true); // flip the image on the y axis

	ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_S, ctx.CLAMP_TO_EDGE); // set the wrapping parameter for the texture
	ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_T, ctx.CLAMP_TO_EDGE);
	ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MIN_FILTER, ctx.LINEAR); // set the filtering parameter for the texture
	ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MAG_FILTER, ctx.LINEAR);


	ctx.bindTexture(ctx.TEXTURE_2D, null); // unbind the texture
	//
	// creating matrices and tell the OPENCV to use the program
	//
	ctx.useProgram(program);

	var matWorldUniformLocation = ctx.getUniformLocation(program, 'mWorld'); // get the location of the uniform variable in the program
	var matViewUniformLocation = ctx.getUniformLocation(program, 'mView');
	var matProjUniformLocation = ctx.getUniformLocation(program, 'mProj');

	var worldMatrix = new Float32Array(16); // create a 4x4 matrix
	var viewMatrix = new Float32Array(16);
	var projMatrix = new Float32Array(16);


	glMatrix.mat4.identity(worldMatrix); // set the matrix to the identity matrix
	glMatrix.mat4.lookAt(viewMatrix, [0, 0, -10], [0, 0, 0], [0, 1, 0]); // set the view matrix first is the position of the camera, second is the point the camera is looking at, third is the up direction
	glMatrix.mat4.perspective(projMatrix, glMatrix.glMatrix.toRadian(45), canvas.width / canvas.height, 0.1, 1000.0); // set the projection matrix first is the field of view, second is the aspect ratio, third is the near clipping plane, fourth is the far clipping plane

	ctx.uniformMatrix4fv(matWorldUniformLocation, ctx.FALSE, worldMatrix); // set the uniform variable in the program to the matrix
	ctx.uniformMatrix4fv(matViewUniformLocation, ctx.FALSE, viewMatrix);
	ctx.uniformMatrix4fv(matProjUniformLocation, ctx.FALSE, projMatrix);

	var xRotationMatrix = new Float32Array(16);	// create a 4x4 matrix for rotation around the x axis
	var yRotationMatrix = new Float32Array(16);  // create a 4x4 matrix for rotation around the y axis
	var ZRotationMatrix = new Float32Array(16); // create a 4x4 matrix for rotation around the z axis


	//
	// main render loop
	//

	var identityMatrix = new Float32Array(16);
	glMatrix.mat4.identity(identityMatrix);
	var angle = 0;
	var loop = function()
	{
	
		angle = performance.now() / 1000 / 6 * 2 * Math.PI;
		glMatrix.mat4.rotate(yRotationMatrix, identityMatrix, angle, [0, 1, 0]); // rotate the matrix around the y axis
		glMatrix.mat4.rotate(xRotationMatrix, identityMatrix, angle, [1, 0, 0]); // rotate the matrix around the x axis
		glMatrix.mat4.mul(worldMatrix, yRotationMatrix, xRotationMatrix); // multiply the matrices together
		
		ctx.uniformMatrix4fv(matWorldUniformLocation, ctx.FALSE, worldMatrix); // set the uniform variable in the program to the matrix

		ctx.clearColor(0.75, 0.85, 0.8, 1.0);
		ctx.clear(ctx.COLOR_BUFFER_BIT | ctx.DEPTH_BUFFER_BIT);

		ctx.bindTexture(ctx.TEXTURE_2D, boxTexture); // bind the texture to the target
		ctx.activeTexture(ctx.TEXTURE0); // set the active texture to the first texture

		ctx.drawElements(ctx.TRIANGLES, boxIndices.length, ctx.UNSIGNED_SHORT, 0);
		requestAnimationFrame(loop);
	}
	requestAnimationFrame(loop);
};
	
init();

