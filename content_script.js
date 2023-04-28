window.addEventListener('load', e => {
    function createToastElement() {
        const toast = document.createElement('div');
        toast.style.position = 'fixed';
        toast.style.top = '50%';
        toast.style.left = '50%';
        toast.style.transform = 'translate(-50%, -50%)';
        toast.style.zIndex = '999';
        toast.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        toast.style.color = 'white';
        toast.style.padding = '15px';
        toast.style.borderRadius = '5px';
        toast.style.textAlign = 'center';
        toast.style.display = 'inline-block';
        toast.style.pointerEvents = 'auto';
        toast.style.fontSize = '14px';
        return toast;
    }
    function showToast(message, duration, err) {
        const toast = createToastElement();
        if (err) toast.style.backgroundColor = 'rgba(255, 0, 0, 0.7)';
        toast.innerText = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), duration);
    }
    function addCheckbox(force) {
        if (!force && document.querySelector('input[type=checkbox].captureCheck')) return;
        const itemList = [...document.querySelectorAll('div.text-base > div.flex.flex-col.relative.items-end')];
        itemList.forEach(item => {
            if ([...item.children].filter(element => element instanceof HTMLInputElement).length) return;
            let input = document.createElement('input')
            input.classList.add('captureCheck')
            input.setAttribute('type', 'checkbox')
            input.style.marginTop = '10px'
            item.appendChild(input)
            item.style.alignItems = 'center'
            input.addEventListener('change', async e => await captureTalk())
            input.style.opacity = '0'
            input.style.transition = 'opacity 1s'
            requestAnimationFrame(() => input.style.opacity = '1')
        })
        return !!itemList.length;
    }
    async function captureTalk() {
        const width = document.querySelector('div.text-base').getBoundingClientRect().width;
        const checkBoxes = [...document.querySelectorAll('div.text-base > div.flex.flex-col.relative.items-end input[type=checkbox].captureCheck')];
        let cloneElement = checkBoxes.filter(chk => chk.checked).map(chk => {
            const talkBox = chk.parentElement.parentElement
            const bgcolor = getComputedStyle(talkBox.parentElement).backgroundColor
            const clone = talkBox.cloneNode(true)
            clone.style.backgroundColor = bgcolor
            clone.style.padding = `${Math.round(width * 0.05)}px`
            clone.querySelector('input[type=checkbox].captureCheck')?.remove()
            return clone
        });
        if (cloneElement.length === 0) return;
        let container = document.createElement('div')
        container.style.width = `${width * 1}px`
        container.style.position = 'absolute'
        container.style.left = `${-width * 10}px`
        container.style.top = `${-width}px`
        cloneElement.forEach(element => container.appendChild(element))
        document.body.appendChild(container)
        try {
            await captureAndCopyElementToClipboard(container)
            showToast('Messages are copied into clipboard as image', 1500)
        } catch {
            showToast('Failed to capture', 1500, true)
        }
        container.remove()
    }
    async function captureAndCopyElementToClipboard(element) {
        const canvas = await html2canvas(element);
        const blob = await new Promise((resolve) => canvas.toBlob(resolve));
        const clipboardItem = new ClipboardItem({ 'image/png': blob });
        await navigator.clipboard.write([clipboardItem]);
    }
    let lastState;
    const stateName = 'Regenerate response';
    setInterval(() => {
        addCheckbox(false)
        const bottomButton = document.querySelector('button.btn.relative.btn-neutral.border-0')
        if (!bottomButton) return;
        if (lastState !== stateName && bottomButton.innerText === stateName) addCheckbox(true)
        lastState = bottomButton.innerText
    }, 1000)
})
/*
    chrome://extensions/
*/