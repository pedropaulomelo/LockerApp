var keyboards = document.getElementsByClassName('virtual-keyboard');
var textareas = document.getElementsByTagName('textarea');
var inputs = document.getElementsByTagName('input');

for (keyboard of keyboards) {
	keyboard.innerHTML = '<div class="lowercase-row"> <span class="key" onmousedown="typeVirtualKeyboardKey(this.innerHTML)">1</span> <span class="key" onmousedown="typeVirtualKeyboardKey(this.innerHTML)">2</span> <span class="key" onmousedown="typeVirtualKeyboardKey(this.innerHTML)">3</span> <span class="key" onmousedown="typeVirtualKeyboardKey(this.innerHTML)">4</span> <span class="key" onmousedown="typeVirtualKeyboardKey(this.innerHTML)">5</span> <span class="key" onmousedown="typeVirtualKeyboardKey(this.innerHTML)">6</span> <span class="key" onmousedown="typeVirtualKeyboardKey(this.innerHTML)">7</span> <span class="key" onmousedown="typeVirtualKeyboardKey(this.innerHTML)">8</span> <span class="key" onmousedown="typeVirtualKeyboardKey(this.innerHTML)">9</span> <span class="key" onmousedown="typeVirtualKeyboardKey(this.innerHTML)">0</span> <span class="key" onmousedown="typeVirtualKeyboardKey(this.innerHTML)" style="width: 100px;">Limpar</span> </div>'
}

for (textarea of textareas) {
	textarea.setAttribute('onclick', 'selectTextbox(this)');
}

for (input of inputs) {
	if (input.type == 'text' || input.type == 'password') {
		input.setAttribute('onclick', 'selectTextbox(this)');
	}
}