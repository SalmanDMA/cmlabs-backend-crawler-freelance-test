import multer from 'multer';
import path from 'path';

export const upload = multer({
	limits: { fileSize: 500 * 1024 * 1024 },
	fileFilter: (_req, file, cb) => {
		const mime = (file.mimetype || '').toLowerCase();
		const ext = path.extname(file.originalname).toLowerCase();

		const allowedExt = [
			'.jpg',
			'.jpeg',
			'.png',
			'.webp',
			'.bmp',
			'.gif',
			'.tiff',
			'.ico',
			'.svg',

			'.mp3',
			'.wav',
			'.ogg',
			'.m4a',
			'.aac',
			'.flac',

			'.mp4',
			'.mov',
			'.avi',
			'.mkv',
			'.webm',

			'.pdf',
			'.doc',
			'.docx',
			'.xls',
			'.xlsx',
			'.ppt',
			'.pptx',

			'.pt',
			'.pth',
			'.ptl',
			'.rknn',
			'.onnx',
			'.tflite',
			'.pb',
			'.h5',
			'.bin',
			'.xml',
			'.mapping',
			'.json',
			'.cfg',
			'.weights',
			'.zip',
			'.tar',
			'.tar.gz',
			'.gz',
			'.mlmodel',
			'.caffemodel',
			'.prototxt',
			'.engine',
		];

		const allowedMime = ['image/', 'audio/', 'video/', 'application/pdf', 'application/msword', 'application/vnd'];

		if (allowedExt.includes(ext)) {
			return cb(null, true);
		}

		if (allowedMime.some((v) => mime.startsWith(v))) {
			return cb(null, true);
		}

		return cb(new Error(`Unsupported file type: ${ext}`));
	},
});
