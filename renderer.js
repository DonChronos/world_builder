var data = {
	a: "123",
	b: "test"
}
var jsonData = JSON.stringify(data);
function download(content, fileName, contentType) {
	var a = document.createElement("a");
	var file = new Blob([content], {type: contentType});
	a.href = URL.createObjectURL(file);
	a.download = fileName;
	a.click();
	URL.revokeObjectURL(a.href);
}
document.getElementById('download').addEventListener('click', async () => {
 await download(jsonData, 'json.txt', 'text/plain'); 
})

document.getElementById('toggle-dark-mode').addEventListener('click', async () => {
  const isDarkMode = await window.darkMode.toggle()
  document.getElementById('theme-source').innerHTML = isDarkMode ? 'Dark' : 
'Light'
})

document.getElementById('reset-to-system').addEventListener('click', async () => 
{
  await window.darkMode.system()
  document.getElementById('theme-source').innerHTML = 'System'
})

dragElement(document.getElementById("mydiv"));

function dragElement(elem) {
	var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
	if (document.getElementById(elem.id + "header")) {
		document.getElementById(elem.id + "header").onmousedown = dragMouseDown;
	} else {
		elem.onmousedown = dragMouseDown;
	}
	
	function dragMouseDown(e) {
		e = e || window.event;
		e.preventDefault();
		pos3 = e.clientX;
		pos4 = e.clientY;
		document.onmouseup = closeDragElement;
		document.onmousemove = elementDrag;
	}
	
	function elementDrag(e) {
		e = e || window.event;
		e.preventDefault();
		pos1 = pos3 - e.clientX;
		pos2 = pos4 - e.clientY;
		pos3 = e.clientX;
		pos4 = e.clientY;
		elem.style.top = (elem.offsetTop - pos2) + "px";
		elem.style.left = (elem.offsetLeft - pos1) + "px";
	}
	
	function closeDragElement() {
		document.onmouseup = null;
		document.onmousemove = null;
	}
}