Hooks.on('renderJournalDirectory', (app, html, data) => {
    const importDiv = $(`
        <div class="header-actions action-buttons flexrow">
            <button class='import-md-btn'><i class='fas fa-file-markdown'></i> Import MD</button>
            <input type='file' id='md-upload-input' accept='.md' style='display:none' multiple>
        </div>
    `);

    html.find('.header-actions').after(importDiv);

    const fileInput = importDiv.find('#md-upload-input');
    
    importDiv.find('.import-md-btn').click(() => fileInput.click());

    fileInput.change(async (event) => {
        const files = event.target.files;
        for (let file of files) {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const content = e.target.result;
                const name = file.name.replace(".md", "");
                await createJournalEntry(name, content);
            };
            reader.readAsText(file);
        }
        ui.notifications.info(`${files.length} work in progress...`);
    });
});

async function createJournalEntry(name, content) {
    const htmlContent = parseMarkdown(content);

    await JournalEntry.create({
        name: name,
        pages: [{
            name: name,
            type: "text",
            text: {
                content: htmlContent,
                format: CONST.JOURNAL_ENTRY_PAGE_FORMATS.HTML
            }
        }]
    });
}

function parseMarkdown(text) {
    return text
        .replace(/\n/g, "<br>")
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/\*\*(.*)\*\*/gim, '<b>$1</b>')
        .replace(/\*(.*)\*/gim, '<i>$1</i>');
}