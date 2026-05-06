Hooks.on('renderJournalDirectory', (app, html, data) => {
    console.log("MD to Journal | Rendering della sidebar Journal rilevato!");

    // Se il pulsante esiste già (per evitare duplicati al refresh), non fare nulla
    if (html.find('.import-md-btn').length > 0) return;

    // Definiamo il pulsante
    const importDiv = $(`
        <div class="header-actions action-buttons flexrow">
            <button type="button" class='import-md-btn'>
                <i class='fas fa-file-markdown'></i> Importa MD
            </button>
            <input type='file' id='md-upload-input' accept='.md' style='display:none' multiple>
        </div>
    `);

    // Proviamo a inserirlo in cima alla lista dei Journal
    const header = html.find(".header-actions");
    if (header.length > 0) {
        header.after(importDiv);
        console.log("MD to Journal | Pulsante inserito con successo.");
    } else {
        console.error("MD to Journal | Non ho trovato la classe .header-actions!");
    }

    // Logica del click
    importDiv.find('.import-md-btn').on('click', (event) => {
        event.preventDefault();
        html.find('#md-upload-input').click();
    });

    // Gestione del cambio file
    html.find('#md-upload-input').on('change', async (event) => {
        const files = event.target.files;
        if (!files.length) return;
        ui.notifications.info(`Caricamento di ${files.length} file...`);
        
        for (let file of files) {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const name = file.name.replace(".md", "");
                await createJournalEntry(name, e.target.result);
            };
            reader.readAsText(file);
        }
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