const express = require('express');
const url = require('url');
const path = require('path');
const mockjs = require('mockjs');
const formidable = require('formidable');
const app = express();

const Random = mockjs.Random;

// 开静态
app.use(express.static('static'));
app.use('/uploads', express.static('uploads'));


app.get('/checknickname', (req, res) => {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Method', 'GET');
	res.setHeader('Access-Control-Allow-Content', '*');
 	
 	var nickname = url.parse(req.url, true).query.nickname;
 	var shujuku = ['张培', '韩欣', '小冰'];

 	res.json({
 		'isExist': shujuku.includes(nickname)
 	});
});

app.options('/upload', (req, res) => {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Method', 'OPTIONS, POST');
	res.setHeader('Access-Control-Allow-Content', '*');
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

	res.json({});
});

app.post('/upload', (req, res) => {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Method', 'OPTIONS, POST');
	res.setHeader('Access-Control-Allow-Content', '*');
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
 
	// parse a file upload
    var form = new formidable.IncomingForm();

    // 配置上传文件夹
 	form.uploadDir = __dirname + "/uploads";
 	// 保留扩展名
 	form.keepExtensions = true;

    form.parse(req, function(err, fields, files) {
		res.json({
			'ok': true,
			'filename': path.parse(files.tupian.path).base
		});
    });
 
});

app.listen(3000);