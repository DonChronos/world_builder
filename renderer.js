const RTK = window.RTK;
const addTab = RTK.createAction("ADD_TAB");
const removeTab = RTK.createAction("REMOVE_TAB");
const renameTab = RTK.createAction("RENAME_TAB");
const changeTabNumber = RTK.createAction("CHANGE_TAB_NUMBER")
const initialState = {
	name: "test",
	tabs: [ ],
	activeTab: "",
};

// since you can't change place of tabs, send payload of order
// have to use filter
const tabs = RTK.createReducer(initialState, (builder) => {
	builder
		.addCase('ADD_TAB', (state, action) => {
			console.log(action);
			let testTab = {
				id: action.payload.id,
				name: action.payload.name,
				blocks: [],
				connections: [],
			};
			console.log('before', RTK.current(state));
			state.tabs.push(testTab);
			console.log('after', RTK.current(state));
		})
		.addCase('REMOVE_TAB', (state, action) => {
			console.log(action);
			console.log('before', RTK.current(state));
			let foundIndex = state.tabs.findIndex(tab => tab.id === action.payload);
			state.tabs.splice(foundIndex, 1);
			console.log('after', RTK.current(state));
		})
		.addCase('RENAME_TAB', (state, action) => {
			console.log(action.payload);
			console.log(RTK.current(state.tabs));
			console.log('before', RTK.current(state));
			let found = state.tabs.find(tab => tab.id === action.payload.id);
			found.name = action.payload.name;
			console.log('after', RTK.current(state));
		})
});
const store = RTK.configureStore({ reducer: tabs });
// const test = store.getState();

/* var data = {
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
*/
document.getElementById('moon').addEventListener('click', async () => {
  const isDarkMode = await window.darkMode.toggle()
})

/* const dropArea = document.getElementById('drop-area');
dropArea.addEventListener('dragover', event => {
	event.stopPropagation();
	event.preventDefault();
	event.dataTransfer.dropEffect = 'copy';
});
dropArea.addEventListener('drop', event => {
	event.stopPropagation();
	event.preventDefault();
	const fileList = event.dataTransfer.files;
	console.log(fileList);
	readFile(fileList[0]);
});
*/

const fileSelector = document.getElementById('file-selector');
fileSelector.addEventListener('change', event => {
	const fileList = event.target.files;
	console.log(fileList);
	console.log(fileList[0]);
	readFile(fileList[0]);
});

function readFile(file) {
	if (file.type && !file.type.startsWith('text/')) {
		console.log('File is not text', file.type, file);
		return;
	}
	const reader = new FileReader();
	/* const test = document.getElementById('test');
	reader.addEventListener('load', event => {
		console.log(event.target.result);
		test.innerText = event.target.result;
	});
	*/
	reader.readAsText(file);
}


const header = document.getElementById('header');
const add_tab = document.getElementById('add_tab');
add_tab.addEventListener('click', event => {
	let id = uuidv4();
	let newTab = document.createElement('div');
	let newTabDiv = document.createElement('div');
	let newTabClose = document.createElement('button');
	let newTabName = document.createTextNode('Name');
	let newTabCloseX = document.createTextNode('X');
	newTabDiv.appendChild(newTabName);
	newTabClose.appendChild(newTabCloseX);
	newTabDiv.setAttribute('contentEditable', 'true');
	newTabDiv.addEventListener('keydown', event => {
		if (event.key === "Enter") {
			event.preventDefault();
			newTabDiv.setAttribute('contentEditable', 'false');
			store.dispatch(renameTab({ id: id, name: event.target.innerText }));
		}
	})
	newTabDiv.style.display = 'inline-block';
	newTabClose.addEventListener('click', event => {
		store.dispatch(removeTab(id));
		newTab.remove();
	});
	add_tab.before(newTab);
	newTab.prepend(newTabDiv);
	newTab.append(newTabClose);
	store.dispatch(addTab({ id: id, name: "Name" }));
});

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
