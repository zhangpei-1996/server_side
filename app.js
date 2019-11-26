const express = require('express');
const url = require('url');
const path = require('path');
const mockjs = require('mockjs');
const formidable = require('formidable');
const session = require('express-session');
const app = express();
const fs = require('fs');
const gm = require('gm');

const Random = mockjs.Random;

// 开静态
app.use(express.static('static'));
app.use('/uploads', express.static('uploads'));


// session，登录注册的必背品。
app.set('trust proxy', 1);
app.use(session({
	secret: 'adafdsf',
	resave: false
}));


// 测试的时候，直接赋予一个session
app.get('*', (req,res,next)=>{
	req.session.login = true;
	req.session.username = 'xiaoming';
	next();
})



// 接口读取当前已经登录的用户信息
app.get('/userinfo', (req, res) => {
	if(!req.session.login) {
		res.status(401);
		res.send('-1');
		return ;
	}


	// 准备一个用户清单，模拟数据库，真正开发的时候使用MySQL数据库的
	fs.readFile('./data/users.txt', (err, content) => {
		var arr = JSON.parse(content.toString());

		//  遍历看看有没有匹配的username和password
	 
		for(let i = 0; i < arr.length; i++){
			if(arr[i].username == req.session.username){
				res.json({
					username: arr[i].username,
					avatar: arr[i].avatar,
					nickname: arr[i].nickname
				});
				return ;
			}
		}
	});

	
});

 

// 测试接口，get请求的login接口
app.post('/login', (req, res) => {
	// formidable是实现post请求的
	var form = new formidable.IncomingForm();
	form.parse(req, function(err, fields, files) {
		var username = fields.username;
		var password = fields.password;
		
		// 准备一个用户清单，模拟数据库，真正开发的时候使用MySQL数据库的
		fs.readFile('./data/users.txt', (err, content) => {
			var arr = JSON.parse(content.toString());

			//  遍历看看有没有匹配的username和password
			var isExist = false;
			for(let i = 0; i < arr.length; i++){
				if(arr[i].username == username && arr[i].password == password){
					isExist = true;
					break;
				}
			}

			if(isExist) {
				// 检查session是否存在
				req.session.login = true;
				req.session.username = username;

				res.json({
					'login': true
				});
			}else{
				req.session.login = false;
				req.session.username = '';
				res.json({
					'login': false
				});
			}
		});
	});
});


// 检查昵称是否重复
app.get('/checknickname', (req, res) => {
 	var nickname = url.parse(req.url, true).query.nickname;
 	var shujuku = ['张培', '韩欣', '小冰'];

 	res.json({
 		'isExist': shujuku.includes(nickname)
 	});
});


// 测试接口，鉴权测试
app.get('/test', (req, res) => {
	if(!req.session.login) {
		res.status(401);
		res.send('-1');
		return ;
	}

	res.json({
		a: 10
	});
});


 
// 真正上传图片
app.post('/upload', (req, res) => {
	// parse a file upload
    var form = new formidable.IncomingForm();

    // 配置上传文件夹
 	form.uploadDir = __dirname + "/uploads";
 	// 保留扩展名
 	form.keepExtensions = true;

    form.parse(req, function(err, fields, files) {
    	var readStream = fs.createReadStream(__dirname + '/uploads/' + path.parse(files.tupian.path).base);
    	// 用gm得到上传的这个图片的真实宽度、高度
    	gm(readStream).size(function(err, info){
    		res.json({
				'ok': true,
				'filename': path.parse(files.tupian.path).base,
				'width': info.width,
				'height': info.height,
			});
		 
    	});
		
    });
});


// 裁切
app.get('/logout', (req, res) => {
	req.session.login = false;
	req.session.username = '';
});

// 裁切
app.get('/cut', (req, res) => {
	var w = url.parse(req.url, true).query.w;
	var h = url.parse(req.url, true).query.h;
	var x = url.parse(req.url, true).query.x;
	var y = url.parse(req.url, true).query.y;
	var filename = url.parse(req.url, true).query.filename;

	var readStream = fs.createReadStream(__dirname + '/uploads/' + filename);
	// 随机一个名字
	var randommingzi = 'sj' + ~~(Math.random() * 999999999999 ) + '.jpg';
	gm(readStream)
		.crop(w, h, x, y)
		.write(__dirname + '/static/avatars/' + randommingzi , function (err) {
		  	if (!err) {
		  		fs.readFile('./data/users.txt', (err, content) => {
					var arr = JSON.parse(content.toString());

					// 改数据库
			  		for(let i = 0; i < arr.length; i++){
						if(arr[i].username == req.session.username){
							arr[i].avatar = randommingzi;
							break;
						}
					}

					// 写回去
					fs.writeFile('./data/users.txt', JSON.stringify(arr), function(){
						console.log('★');
						res.send('');
					})
				});
		  	}
		});
});


app.get('/allrw', (req, res)=>{
	var page = url.parse(req.url, true).query.page;
	var done = url.parse(req.url, true).query.done;

	// 每页10条
	fs.readFile('./data/rw.txt', (err, content) => {
		var allarr = JSON.parse(content.toString());

		if(done == 'true') {
			allarr = allarr.filter(item => item.done);
		}else if(done == 'false'){
			allarr = allarr.filter(item => !item.done);
		}

		// console.log(done)

		var _arr = allarr.slice((page - 1) * 10, page * 10);

		// 每页10条
		fs.readFile('./data/users.txt', (err, userscontent) => {
			var userarr = JSON.parse(userscontent.toString());

			// 索引对象
			var userobj = {};
			userarr.forEach(item => {
				delete item.password;
				userobj[item.id] = item;
			});

			_arr.forEach(item => {
				item.executor = item.executor.map(id => userobj[id])
			});

			res.json({
				'total': allarr.length,
				'rws': _arr
			});
		});		
	})
});




app.listen(3000);