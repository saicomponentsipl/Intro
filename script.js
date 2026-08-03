
pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

// ============================================================
// One entry per brand. "files" can have 1 or 2 catalogues —
// the popup automatically shows exactly that many buttons.
// ============================================================
const catalogueData = {
    rexnord: { name: "REXNORD", files: [{ label: "View Product Catalogue", url: "./catalogues/Rexnord Single page.pdf" }] },
    superflow: { name: "SUPER FLOW", files: [{ label: "View Product Catalogue", url: "./catalogues/Super Flow Single Page.pdf" }] },
    almonard: { name: "ALMONARD", files: [{ label: "View Product Catalogue", url: "./catalogues/Amonard.pdf" }] },
    astberg: { name: "ASTBERG", files: [{ label: "View Product Catalogue", url: "./catalogues/Astberg.pdf" }] },
    jainsons: { name: "JAINSONS", files: [{ label: "View Product Catalogue", url: "./catalogues/JAINSON AIR VENT.pdf" }] },
    raychem: { name: "RPG RAYCHEM", files: [{ label: "View Product Catalogue", url: "./catalogues/RPG Raychem.pdf" }] },
    // eleccomp:  { name: "Electronic Components", files: [ { label: "Product Catalogue", url: "./catalogues/electronic-components.pdf" } ] },
    // gifting:   { name: "Corporate Gifting", files: [ { label: "Product Catalogue", url: "./catalogues/gifting-main.pdf" }, { label: "Corporate Range", url: "./catalogues/gifting-corporate.pdf" } ] }
};

// ---------- small brand popup ----------
function openBrandPopup(brandKey) {
    const brand = catalogueData[brandKey];
    if (!brand) return;

    document.getElementById('brandPopupTitle').textContent = brand.name;

    const actions = document.getElementById('brandPopupActions');
    actions.innerHTML = brand.files.map(f =>
        `<button class="brand-popup-btn" onclick="closeBrandPopup(); openCatalogue('${f.url}', '${brand.name}')">📄 ${f.label}</button>`
    ).join('');

    document.getElementById('brandPopupOverlay').style.display = 'flex';
}

function closeBrandPopup(e) {
    document.getElementById('brandPopupOverlay').style.display = 'none';
}

// ---------- full-screen view-only PDF viewer ----------
let currentPdf = null, currentPage = 1, totalPages = 1;

async function openCatalogue(fileUrl, brandName) {
    document.getElementById('catalogueBrandName').textContent = brandName;
    // document.getElementById('catalogueLabelName').textContent = labelName;
    document.getElementById('catalogueModal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
    document.getElementById('pageIndicator').textContent = '– / –';
    document.getElementById('catalogueViewer').innerHTML =
        '<div class="catalogue-loading">Loading catalogue…</div>';

    try {
        currentPdf = await pdfjsLib.getDocument(fileUrl).promise;
        totalPages = currentPdf.numPages;
        currentPage = 1;
        document.getElementById('catalogueViewer').innerHTML =
            '<canvas id="catalogueCanvas"></canvas>';
        renderPage(currentPage);
    } catch (err) {
        console.error('openCatalogue failed:', fileUrl, err);
        document.getElementById('catalogueViewer').innerHTML =
            '<div class="catalogue-loading">Couldn\'t load this catalogue. Please try again.</div>';
    }
}

async function renderPage(num) {
    try {
        const page = await currentPdf.getPage(num);
        const canvas = document.getElementById('catalogueCanvas');
        const ctx = canvas.getContext('2d');

        await new Promise(resolve => requestAnimationFrame(resolve));

        const viewerEl = document.getElementById('catalogueViewer');
        const padding = 32;
        let containerWidth = viewerEl.clientWidth - padding;
        let containerHeight = viewerEl.clientHeight - padding;
        if (!containerWidth || containerWidth < 200) containerWidth = 600;
        if (!containerHeight || containerHeight < 200) containerHeight = 500;

        const unscaled = page.getViewport({ scale: 1 });

        const widthScale = containerWidth / unscaled.width;
        const heightScale = containerHeight / unscaled.height;
        const displayScale = Math.min(Math.max(Math.min(widthScale, heightScale), 0.3), 2.2);

        const dpr = window.devicePixelRatio || 1;
        const MIN_RENDER_SCALE = 2.5;
        let renderScale = Math.max(displayScale * dpr, MIN_RENDER_SCALE);

        const displayViewport = page.getViewport({ scale: displayScale });
        let renderViewport = page.getViewport({ scale: renderScale });

        // Safety cap: most browsers choke somewhere around 16 million pixels
        // (e.g. 4096x4096). If we'd exceed that, back off the render scale.
        const MAX_CANVAS_AREA = 16000000;
        if (renderViewport.width * renderViewport.height > MAX_CANVAS_AREA) {
            const safeScale = Math.sqrt(MAX_CANVAS_AREA / (unscaled.width * unscaled.height));
            renderScale = Math.max(safeScale, displayScale); // never go below display size
            renderViewport = page.getViewport({ scale: renderScale });
        }

        canvas.width = Math.floor(renderViewport.width);
        canvas.height = Math.floor(renderViewport.height);
        canvas.style.width = displayViewport.width + "px";
        canvas.style.height = displayViewport.height + "px";

        await page.render({ canvasContext: ctx, viewport: renderViewport }).promise;

        document.getElementById('pageIndicator').textContent = num + ' / ' + totalPages;
    } catch (err) {
        console.error('renderPage failed:', err);
        document.getElementById('catalogueViewer').innerHTML =
            '<div class="catalogue-loading">Couldn\'t display this page. Please try again.</div>';
    }
}

function nextPage() { if (currentPage < totalPages) { currentPage++; renderPage(currentPage); } }
function prevPage() { if (currentPage > 1) { currentPage--; renderPage(currentPage); } }

function closeCatalogue() {
    document.getElementById('catalogueModal').style.display = 'none';
    document.body.style.overflow = '';
    currentPdf = null;
}

document.addEventListener('keydown', e => {
    if (document.getElementById('catalogueModal').style.display === 'flex') {
        if (e.key === 'Escape') closeCatalogue();
        if (e.key === 'ArrowRight') nextPage();
        if (e.key === 'ArrowLeft') prevPage();
    } else if (document.getElementById('brandPopupOverlay').style.display === 'flex') {
        if (e.key === 'Escape') closeBrandPopup();
    }
});

document.addEventListener('dragstart', e => {
    if (e.target.tagName === 'CANVAS') e.preventDefault();
});

// Hari Prassad Contact Dataset
const contacts = [
    {
        firstName: "Hari",
        lastName: "Prassad",
        fullName: "Hari Prassad",
        company: "SAI COMPONENTS INDIA PRIVATE LIMITED",
        title: "Head Business Development",
        mobile: "+91 9945933111",
        officeMobile: "+91 8088791291",
        landline: "080-41600647",
        email1: "saicomponents@ymail.com",
        email2: "saicomponents107@gmail.com",
        mapLocation1: "https://maps.app.goo.gl/AAWYzjx7GUb5FoDo6",
        mapLocation2: "https://maps.app.goo.gl/b7fcwUk5fd3PFwjC8",
        note: "Karnataka's Exclusive Branch Office for Rexnord & Superflow. Authorized Distributors for Almonard, Astberg, Jainsons, RPG Raychem."
    },
    {
        firstName: "Murali",
        lastName: "Krishna",
        fullName: "Murali Krishna",
        company: "SAI COMPONENTS INDIA PRIVATE LIMITED",
        title: "Director Sales & Operations",
        mobile: "+91 9980060647",
        officeMobile: "+91 8088791291",
        landline: "080-41600647",
        email1: "saicomponents@ymail.com",
        email2: "saicomponents107@gmail.com",
        mapLocation1: "https://maps.app.goo.gl/AAWYzjx7GUb5FoDo6",
        mapLocation2: "https://maps.app.goo.gl/b7fcwUk5fd3PFwjC8",
        note: "Karnataka's Exclusive Branch Office for Rexnord & Superflow. Authorized Distributors for Almonard, Astberg, Jainsons, RPG Raychem."
    },
    {
        firstName: "SAI COMPONENTS",
        lastName: "INDIA PRIVATE LIMITED",
        fullName: "SAI COMPONENTS INDIA PRIVATE LIMITED",
        company: "SAI COMPONENTS INDIA PRIVATE LIMITED",
        title: "Office Contact Details",
        mobile: "+91 8088791291",
        officeMobile: "",
        landline: "080-41600647",
        email1: "saicomponents@ymail.com",
        email2: "saicomponents107@gmail.com",
        mapLocation1: "https://maps.app.goo.gl/AAWYzjx7GUb5FoDo6",
        mapLocation2: "https://maps.app.goo.gl/b7fcwUk5fd3PFwjC8",
        note: "Karnataka's Exclusive Branch Office for Rexnord & Superflow. Authorized Distributors for Almonard, Astberg, Jainsons, RPG Raychem."
    }
];

// Generate Location QR Codes dynamically
document.getElementById('qrLoc1').src = "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=" + encodeURIComponent(contacts[0].mapLocation1);
document.getElementById('qrLoc2').src = "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=" + encodeURIComponent(contacts[0].mapLocation2);

function showToast(msg) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
}

function saveContact(index) {
    const c = contacts[index];

    const vcardContent = [
        "BEGIN:VCARD",
        "VERSION:3.0",
        "N:" + c.lastName + ";" + c.firstName + ";;;",
        "FN:" + c.fullName,
        "ORG:" + c.company,
        "TITLE:" + c.title,
        "TEL;TYPE=CELL,VOICE:" + c.mobile,
        "TEL;TYPE=WORK,VOICE:" + c.officeMobile,
        "TEL;TYPE=WORK,FAX:" + c.landline,
        "EMAIL;TYPE=INTERNET,WORK:" + c.email1,
        "EMAIL;TYPE=INTERNET,WORK:" + c.email2,
        "URL;TYPE=WORK:" + c.mapLocation1,
        "NOTE:" + c.note,
        "END:VCARD"
    ].join("\n");

    const blob = new Blob([vcardContent], { type: "text/vcard;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = c.fullName + ".vcf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(c.fullName + "'s vCard Downloaded ✓");
}

async function shareCard(index) {
    const c = contacts[index];
    // const shareText = "SAI COMPONENTS INDIA PRIVATE LIMITED\n" + c.fullName + " - " + c.title + "\nMobile: " + c.mobile + "\nEmail: " + c.email1 + ", " + c.email2 + "\nLocation 1: " + c.mapLocation1 + "\nLocation 2: " + c.mapLocation2;
    const shareText = "*SAI COMPONENTS INDIA PRIVATE LIMITED*\n" + c.note + "\n" + "\n" + c.fullName + " - " + c.title + "\nMobile: " + c.mobile + "\nEmail: " + c.email1 + ", " + c.email2 + "\nWebsite: ";
    if (navigator.share) {
        try {
            await navigator.share({
                title: c.fullName + " - " + c.title,
                text: shareText,
                url: window.location.href
            });
            return;
        } catch (err) { }
    }

    try {
        await navigator.clipboard.writeText(shareText + "\nLink: " + window.location.href);
        showToast("Contact card copied to clipboard!");
    } catch (err) {
        showToast("Copy failed, please manual copy.");
    }
}