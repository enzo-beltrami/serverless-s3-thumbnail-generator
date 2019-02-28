const AWS = require('aws-sdk');
const gm = require('gm').subClass({ imageMagick: true });
const bluebird = require('bluebird');
const fs = require('fs');
const utils = require('utils');

bluebird.promisifyAll(gm.prototype);

module.exports.s3 = async (event, context) => {
	const s3 = new AWS.S3();
	const bucket = process.env.bucket;
	const key = event.Records[0].s3.object.key;
	const fileName = key.split('.jpg')[0];
	const filePath = `/tmp/thumb-${fileName}.png`;
	const response = await s3.getObject({ Key: key, Bucket: bucket }).promise();
	await gm(response.Body)
		.resize(100, 100)
		.writeAsync(filePath);
	const object = fs.readFileSync(filePath);
	await s3
		.putObject({
			Key: `thumb-${fileName}.png`,
			Bucket: bucket,
			Body: object,
		})
		.promise();
};
