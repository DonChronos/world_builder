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

// on switch tab destroy blocks of old tab and show blocks of active tab
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
		.addCase('SWITCH_TAB', (state, action) => {
			console.log(action.payload);
			console.log('before', RTK.current(state));
			state.activeTab = action.payload;
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


const add_grabbable = document.getElementById("add_grabbable");
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
		// if no tabs left, make add_grabbable hidden
		// add_grabbable.classList.add('hidden');
	});
	add_tab.before(newTab);
	newTab.prepend(newTabDiv);
	newTab.append(newTabClose);
	store.dispatch(addTab({ id: id, name: "Name" }));
	add_grabbable.classList.remove('hidden');
});

let start = null;
let end = null;
add_grabbable.addEventListener('click', event => {
	let newGrabbable = document.createElement('div');
	let newGrabbableHeader = document.createElement('div');
	let newGrabbableP = document.createElement('p');
	let newAddLine = document.createElement('button');
	let newHeaderText = document.createTextNode('Click here to move');
	let newPText = document.createTextNode('Move');
	let newLineText = document.createTextNode('→');
	newGrabbableHeader.appendChild(newHeaderText);
	newGrabbableP.appendChild(newPText);
	newAddLine.appendChild(newLineText);
	newGrabbableP.setAttribute('contentEditable', 'true');
	/* newGrabbableP.addEventListener('focusout', event => {
		send redux action
	})
	*/
	newGrabbableHeader.setAttribute('contentEditable', 'true');
	newGrabbableHeader.addEventListener('keydown', event => {
		if (event.key === "Enter") {
			event.preventDefault();
			newGrabbableHeader.setAttribute('contentEditable', 'false');
			// send redux action
		}
	});
	newGrabbable.classList.add('grabbable');
	newGrabbableHeader.classList.add('grabbable_header');
	newGrabbable.prepend(newGrabbableHeader);
	newGrabbable.append(newGrabbableP);
	newGrabbable.append(newAddLine);
	add_grabbable.after(newGrabbable);
	draggable = new PlainDraggable(newGrabbable);
	draggable.handle = newGrabbableHeader;
	draggable.containment = {left: 0, top: 30, width: '100%', height: '100%'};
	// add draggable lead line positioning on move
	// make editable labels
	newAddLine.addEventListener('click', event => {
		if (!start && !end) {
			start = newGrabbable;
		} else if (start !== newGrabbable && !end) {
			end = newGrabbable;
			let line = new LeaderLine(start, end);
			start = null;
			end = null;
		}
	});
});
