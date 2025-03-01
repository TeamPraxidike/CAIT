import html2canvas from 'html2canvas';


export const getFileExtension = (filePath: string): string =>  {
	const index = filePath.lastIndexOf('.');
	return index !== -1 ? filePath.substring(index + 1) : '';
}

export const collisionDetection = (x1: number, y1: number, x2: number, y2: number) => {
	const offset = 15
	let dx = 180 - Math.abs(x2 - x1);
	if (dx < 0)
		return null
	if (x1 > x2)
		dx = -dx - offset
	else
		dx += offset

	let dy = 100 - Math.abs(y1 - y2); // 17
	if (dy < 0)
		return null
	if (y2 > y1)
		dy = dy + offset
	else
		dy = -dy - offset

	if (Math.abs(dy) > Math.abs(dx))
		dy = 0
	else
		dx = 0
	return [dx, dy];
}

export async function captureScreenshot () : Promise<string> {
	const container = document.getElementById('flow');
	try{
		if (container) {
			const result = await html2canvas(container)
			const imgData = result.toDataURL('image/png');
			return imgData.split(",")[1];
		}
		return ''
	}
	catch(error)  {
		console.error('Error capturing screenshot:', error);
		return ""
	}
}