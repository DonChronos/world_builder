const RTK = window.RTK;
const addTab = RTK.createAction("ADD_TAB");
const removeTab = RTK.createAction("REMOVE_TAB");
const renameTab = RTK.createAction("RENAME_TAB");
const switchTab = RTK.createAction("SWITCH_TAB")
const addBlock = RTK.createAction("ADD_BLOCK");
const addConnection = RTK.createAction("ADD_CONNECTION");
const loadStore = RTK.createAction("LOAD_STORE");
const saveStore = RTK.createAction("SAVE_STORE");
const increaseBlockId = RTK.createAction("INCREASE_BLOCK_ID");
const initialState = {
	name: "test",
	tabs: [ ],
	activeTab: "",
	blockId: 0,
};

const tabs = RTK.createReducer(initialState, (builder) => {
	builder
		.addCase('ADD_TAB', (state, action) => {
			if (state.tabs.length === 0) state.activeTab = action.payload.id;
			let testTab = {
				id: action.payload.id,
				name: action.payload.name,
				blocks: [],
				connections: [],
			};
			state.tabs.push(testTab);
			// change css of active tab
		})
		.addCase('REMOVE_TAB', (state, action) => {
			let foundIndex = state.tabs.findIndex(tab => tab.id === action.payload);
			state.tabs.splice(foundIndex, 1);
		})
		.addCase('RENAME_TAB', (state, action) => {
			let found = state.tabs.find(tab => tab.id === action.payload.id);
			found.name = action.payload.name;
		})
		.addCase('SWITCH_TAB', (state, action) => {
			let newIndex = action.payload;
			let oldIndex = state.tabs.findIndex(tab => tab.id === state.activeTab);
			if (newIndex === oldIndex) return;
			state.tabs[oldIndex].connections.forEach(con => con.hide());
			state.tabs[oldIndex].blocks.forEach(block => block.classList.toggle('hidden'));
			let newTabId = state.tabs[newIndex].id;
			state.activeTab = newTabId;
			state.tabs[newIndex].connections.forEach(con => con.show());
			state.tabs[newIndex].blocks.forEach(block => block.classList.toggle('hidden'));
		})
		.addCase('ADD_CONNECTION', (state, action) => {
			let foundIndex = state.tabs.findIndex(tab => tab.id === state.activeTab);
			state.tabs[foundIndex].connections.push(action.payload);
		})
		.addCase('ADD_BLOCK', (state, action) => {
			let foundIndex = state.tabs.findIndex(tab => tab.id === state.activeTab);
			state.tabs[foundIndex].blocks.push(action.payload);
		})
		.addCase('LOAD_STORE', (state, action) => action.payload)
		.addCase('SAVE_STORE', (state, action) => {
			let tabs = state.tabs;
			let data_tabs = tabs.map(tab => {
				let connections = tab.connections.map(con => {
					return {
						start: con.start.id,
						end: con.end.id
					}
				}) || [];
				let blocks = tab.blocks.map(block => {
					return {
						id: block.id,
						transform: block.style.transform,
						headerText: block.children[0].innerHTML,
						headerEditable: block.children[0].contentEditable,
						pText: block.children[1].innerHTML
					}
				}) || [];
				return {
					id: tab.id,
					name: tab.name,
					blocks: blocks,
					connections: connections,
				}
			});
			state.data = {
				name: state.name,
				tabs: data_tabs,
				activeTab: state.activeTab,
				blockId: state.blockId
			};
			console.log(RTK.current(state));
		})
		.addCase('INCREASE_BLOCK_ID', (state, action) => {
			state.blockId++
		})
});
const store = RTK.configureStore({ reducer: tabs });


function download(content, fileName, contentType) {
	var a = document.createElement("a");
	var file = new Blob([content], {type: contentType});
	a.href = URL.createObjectURL(file);
	a.download = fileName;
	a.click();
	URL.revokeObjectURL(a.href);
}
document.getElementById('download').addEventListener('click', async () => {
	store.dispatch(saveStore());
	let storeFile = JSON.stringify(store.getState().data);
	await download(storeFile, 'json.txt', 'text/plain');
});

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
	// hide file selector afterwards
	readFile(fileList[0]);
});

function readFile(file) {
	if (file.type && !file.type.startsWith('text/')) {
		console.log('File is not text', file.type, file);
		return;
	}
	const reader = new FileReader();
	reader.addEventListener('load', event => {
		let rawData = JSON.parse(event.target.result);
		console.log(rawData);
		let newDataTabs = rawData.tabs.map(tab => {
			createTab(null, tab.id, tab.name);
			let blocks = tab.blocks.map(block => createGrabbable(null, block.headerText, block.pText, block.id, block.headerEditable, block.transform));
			let connections = tab.connections.map(con => {
				let line = new LeaderLine(document.getElementById(con.start), document.getElementById(con.end), {hide: true});
				return line;
			});
			return {
				id: tab.id,
				name: tab.name,
				blocks: blocks,
				connections: connections
			}
		});
		let newStore = {
			activeTab: rawData.activeTab,
			name: rawData.name,
			tabs: newDataTabs,
			blockId: rawData.blockId
		};
		let activeTabIndex = newStore.tabs.findIndex(tab => tab.id === newStore.activeTab);
		newStore.tabs[activeTabIndex].connections.forEach(con => con.show());
		newStore.tabs[activeTabIndex].blocks.forEach(block => block.classList.toggle('hidden'));
		store.dispatch(loadStore(newStore));
	});
	reader.readAsText(file);
}


const add_grabbable = document.getElementById("add_grabbable");

// ADD TAB //
const header = document.getElementById('header');
const add_tab = document.getElementById('add_tab');

let createTab = (event = null, tabId = null, name = 'Name') => {
	if (event) {
		if (store.getState().tabs.length === 9) return;
	}
	let id = tabId ? tabId : uuidv4();
	let newTab = document.createElement('div');
	let newTabDiv = document.createElement('div');
	let newTabClose = document.createElement('button');
	let newTabName = document.createTextNode(name);
	let newTabCloseX = document.createTextNode('X');
	newTabDiv.appendChild(newTabName);
	newTabClose.appendChild(newTabCloseX);
	// make tab name uneditable after loading state
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
		if (store.getState().tabs.length === 0) add_grabbable.classList.add('hidden');
	});
	add_tab.before(newTab);
	newTab.prepend(newTabDiv);
	newTab.append(newTabClose);
	if (event) store.dispatch(addTab({ id: id, name: "Name" }));
	add_grabbable.classList.remove('hidden');
}
add_tab.addEventListener('click', createTab);

// SWITCH TABS by capturing CTRL+NUMBER //
document.addEventListener('keydown', event => {
	if (event.ctrlKey && event.keyCode >= 48 && event.keyCode <= 57) {
		let state = store.getState();
		if (state.tabs.length === 0) return;
		store.dispatch(switchTab(event.keyCode - 49))
	};
});

// ADD GRABBABLE //
let start = null;
let end = null;
let createGrabbable = (event = null, headerText = 'Click here to move', pText = 'Move', id = undefined, headerEditable = 'true', transform = null) => {
	let newGrabbable = document.createElement('div');
	let newGrabbableHeader = document.createElement('div');
	let newGrabbableP = document.createElement('p');
	let newAddLine = document.createElement('button');
	let newHeaderText = document.createTextNode(headerText);
	let newPText = document.createTextNode(pText);
	let newLineText = document.createTextNode('→');
	newGrabbableHeader.appendChild(newHeaderText);
	if (pText === 'Move') {
		newGrabbableP.appendChild(newPText);
	} else {
		newGrabbableP.innerHTML = pText;
	}
	newAddLine.appendChild(newLineText);
	newGrabbableP.setAttribute('contentEditable', 'true');
	// if p is too big, shorten it. on focus show all
	/* newGrabbableP.addEventListener('focusout', event => {
		send redux action
	})
	*/
	newGrabbableHeader.setAttribute('contentEditable', headerEditable);
	newGrabbableHeader.addEventListener('keydown', event => {
		if (event.key === "Enter") {
			event.preventDefault();
			newGrabbableHeader.setAttribute('contentEditable', 'false');
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
	if (transform) newGrabbable.style.transform = transform;
	// add draggable lead line positioning on move
	// make editable labels
	newAddLine.addEventListener('click', event => {
		if (!start && !end) {
			start = newGrabbable;
		} else if (start !== newGrabbable && !end) {
			end = newGrabbable;
			let line = new LeaderLine(start, end);
			store.dispatch(addConnection(line));
			start = null;
			end = null;
		}
	});
	if (id === undefined) {
		newGrabbable.id = store.getState().blockId;
		store.dispatch(increaseBlockId());
	} else {
		newGrabbable.id = id
	}
	if (!event) {
		newGrabbable.classList.toggle('hidden');
		return newGrabbable;
	} else {
		store.dispatch(addBlock(newGrabbable));
	}
};
add_grabbable.addEventListener('click', createGrabbable);
