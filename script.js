// When the form is submitted, add an entry to the table
document.getElementById("callLogForm").addEventListener("submit", function(e) {
  e.preventDefault();
  addEntry();
});

function addEntry() {
  let tableBody = document.querySelector("#callLogTable tbody");
  let row = document.createElement("tr");
  
  // Field IDs in the order to appear in the table:
  // Phone Number, Date, Time, Caller Name, Age, Sex, Location, Representative,
  // Service Provided, Referral, Referral Site, Consultant, Summary, Agent Name, Call Modality
  let fieldIds = [
    "phoneNumber", "date", "time", "callerName", "age", "sex", "location",
    "representative", "serviceProvided", "referral", "referralSite", "consultant",
    "summary", "agentName", "callModality"
  ];
  
  fieldIds.forEach(function(id) {
    let cell = document.createElement("td");
    let value = document.getElementById(id).value;
    // Replace blank values with "N/A"
    if (!value || value.trim() === "") {
      value = "N/A";
    }
    // If Service Provided is "Other", use the serviceOther field value.
    if (id === "serviceProvided" && value === "Other") {
      let otherValue = document.getElementById("serviceOther").value;
      value = otherValue && otherValue.trim() !== "" ? otherValue : "N/A";
    }
    cell.textContent = value;
    row.appendChild(cell);
  });
  
  // Add Actions cell with an Edit button
  let actionCell = document.createElement("td");
  let editButton = document.createElement("button");
  editButton.textContent = "Edit";
  editButton.addEventListener("click", function() {
    editEntry(row);
  });
  actionCell.appendChild(editButton);
  row.appendChild(actionCell);
  
  tableBody.appendChild(row);
  document.getElementById("callLogForm").reset();
  document.getElementById("serviceOther").style.display = "none";
  document.getElementById("referralSiteGroup").style.display = "none";
}

function editEntry(row) {
  let fieldIds = [
    "phoneNumber", "date", "time", "callerName", "age", "sex", "location",
    "representative", "serviceProvided", "referral", "referralSite", "consultant",
    "summary", "agentName", "callModality"
  ];
  
  fieldIds.forEach(function(id, index) {
    let cellValue = row.cells[index].textContent;
    // If a cell value is "N/A", treat it as empty in the form
    if (cellValue === "N/A") {
      cellValue = "";
    }
    if (id === "serviceProvided") {
      if (["Consultation", "Follow-Up", "Emergency"].includes(cellValue)) {
        document.getElementById(id).value = cellValue;
        document.getElementById("serviceOther").style.display = "none";
      } else {
        document.getElementById(id).value = "Other";
        document.getElementById("serviceOther").style.display = "block";
        document.getElementById("serviceOther").value = cellValue;
      }
    } else {
      document.getElementById(id).value = cellValue;
    }
  });
  
  row.remove();
}

// Show/hide the serviceOther field based on selected option
document.getElementById("serviceProvided").addEventListener("change", function() {
  let serviceOtherInput = document.getElementById("serviceOther");
  if (this.value === "Other") {
    serviceOtherInput.style.display = "block";
    serviceOtherInput.required = true;
  } else {
    serviceOtherInput.style.display = "none";
    serviceOtherInput.required = false;
  }
});

// Show/hide the referralSite group based on referral selection
document.getElementById("referral").addEventListener("change", function() {
  let referralGroup = document.getElementById("referralSiteGroup");
  if (this.value === "Yes") {
    referralGroup.style.display = "block";
  } else {
    referralGroup.style.display = "none";
  }
});

// Export to Excel (CSV export)
function exportToExcel() {
  let csv = [];
  let rows = document.querySelectorAll("table tr");
  rows.forEach(function(row) {
    let rowData = [];
    let cols = row.querySelectorAll("th, td");
    // Skip the last column (Actions)
    for (let i = 0; i < cols.length - 1; i++) {
      let text = cols[i].innerText;
      if (!text || text.trim() === "") {
        text = "N/A";
      }
      rowData.push('"' + text + '"');
    }
    csv.push(rowData.join(","));
  });
  
  let csvFile = new Blob([csv.join("\n")], { type: "text/csv" });
  let downloadLink = document.createElement("a");
  let currentDate = new Date().toISOString().split('T')[0];
  downloadLink.download = "CallCenterRegistry_" + document.getElementById("agentName").value + "_" + currentDate + ".csv";
  downloadLink.href = window.URL.createObjectURL(csvFile);
  downloadLink.style.display = "none";
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
}

// Export to PDF using html2canvas and jsPDF with table aligned at top
function exportToPDF() {
  let container = document.querySelector(".table-container");
  let clone = container.cloneNode(true);
  
  // Remove the last header cell (Actions)
  let ths = clone.querySelectorAll("thead tr th");
  if (ths.length > 0) {
    ths[ths.length - 1].remove();
  }
  // Remove the last cell in each row (Actions)
  let rows = clone.querySelectorAll("tbody tr");
  rows.forEach(function(row) {
    let cells = row.querySelectorAll("td");
    if (cells.length > 0) {
      cells[cells.length - 1].remove();
    }
  });
  
  clone.style.position = "absolute";
  clone.style.top = "0";
  clone.style.left = "-9999px";
  document.body.appendChild(clone);
  
  html2canvas(clone, {
    scrollX: 0,
    scrollY: 0,
    width: clone.scrollWidth,
    height: clone.scrollHeight,
    scale: 1.5,
    useCORS: true
  }).then(canvas => {
    const imgData = canvas.toDataURL('image/png');
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('l', 'pt', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    const ratio = Math.min(pageWidth / canvas.width, pageHeight / canvas.height);
    const pdfWidth = canvas.width * ratio;
    const pdfHeight = canvas.height * ratio;
    
    const x = (pageWidth - pdfWidth) / 2;
    const y = 10;
    
    pdf.addImage(imgData, 'PNG', x, y, pdfWidth, pdfHeight);
    let currentDate = new Date().toISOString().split('T')[0];
    pdf.save("CallCenterRegistry_" + document.getElementById("agentName").value + "_" + currentDate + ".pdf");
    
    document.body.removeChild(clone);
  });
}

// Export to Word as .docx using html-docx-js and FileSaver.js
function exportToWord() {
  let container = document.querySelector(".table-container");
  let clone = container.cloneNode(true);
  
  // Remove the last header cell (Actions)
  let ths = clone.querySelectorAll("thead tr th");
  if (ths.length > 0) {
    ths[ths.length - 1].remove();
  }
  // Remove the last cell in each row (Actions)
  let rows = clone.querySelectorAll("tbody tr");
  rows.forEach(function(row) {
    let cells = row.querySelectorAll("td");
    if (cells.length > 0) {
      cells[cells.length - 1].remove();
    }
  });
  
  let html = '<html xmlns:o="urn:schemas-microsoft-com:office:office" ' +
             'xmlns:w="urn:schemas-microsoft-com:office:word" ' +
             'xmlns="http://www.w3.org/TR/REC-html40">';
  html += '<head><meta charset="utf-8"><title>Call Center Registry</title>';
  html += '<style>table {border-collapse: collapse; width: 100%;} table, th, td {border: 1px solid #333; padding: 3px; text-align: center;} body {font-family: Arial, sans-serif; font-size: 10pt;} @page { size: A4 landscape; margin: 0.5cm; }</style>';
  html += '</head><body>';
  html += clone.innerHTML;
  html += '</body></html>';
  
  var converted = htmlDocx.asBlob(html);
  let currentDate = new Date().toISOString().split('T')[0];
  let fileName = "CallCenterRegistry_" + document.getElementById("agentName").value + "_" + currentDate + ".docx";
  saveAs(converted, fileName);
}
