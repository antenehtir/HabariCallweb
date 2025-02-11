// Show/hide "Other" input for Service Provided
document.getElementById('serviceProvided').addEventListener('change', function(){
  var serviceOtherInput = document.getElementById('serviceOther');
  if (this.value === 'Other') {
    serviceOtherInput.style.display = 'block';
    serviceOtherInput.required = true;
  } else {
    serviceOtherInput.style.display = 'none';
    serviceOtherInput.required = false;
  }
});

// Show/hide Referral Site field based on radio selection
document.getElementsByName('referralMade').forEach(function(radio){
  radio.addEventListener('change', function(){
    var referralSiteDiv = document.getElementById('referralSiteDiv');
    if (this.value === 'Yes') {
      referralSiteDiv.style.display = 'block';
      document.getElementById('referralSite').required = true;
    } else {
      referralSiteDiv.style.display = 'none';
      document.getElementById('referralSite').required = false;
    }
  });
});

// Global counter for record IDs
let recordId = 1;
const tableBody = document.querySelector('#entriesTable tbody');

// Form submission event: add new row to the table
document.getElementById('callForm').addEventListener('submit', function(e){
  e.preventDefault();
  // Gather form values
  const phone = document.getElementById('phone').value;
  const date = document.getElementById('date').value;
  const time = document.getElementById('time').value;
  const callerName = document.getElementById('callerName').value;
  const age = document.getElementById('age').value;
  const sex = document.getElementById('sex').value;
  const location = document.getElementById('location').value;
  const repName = document.getElementById('repName').value;
  let serviceProvided = document.getElementById('serviceProvided').value;
  if (serviceProvided === 'Other') {
    serviceProvided = document.getElementById('serviceOther').value;
  }
  const referralMade = document.querySelector('input[name="referralMade"]:checked').value;
  const referralSite = document.getElementById('referralSite').value;
  const consultant = document.getElementById('consultant').value;
  const duration = document.getElementById('duration').value;
  const summary = document.getElementById('summary').value;
  
  // Create a new table row with the entry data
  const newRow = document.createElement('tr');
  newRow.innerHTML = `
    <td>${recordId}</td>
    <td>${phone}</td>
    <td>${date}</td>
    <td>${time}</td>
    <td>${callerName}</td>
    <td>${age}</td>
    <td>${sex}</td>
    <td>${location}</td>
    <td>${repName}</td>
    <td>${serviceProvided}</td>
    <td>${referralMade}</td>
    <td>${referralMade === 'Yes' ? referralSite : ''}</td>
    <td>${consultant}</td>
    <td>${duration}</td>
    <td>${summary}</td>
    <td>
      <button class="edit-btn">Edit</button>
    </td>
  `;
  tableBody.appendChild(newRow);
  recordId++;
  
  // Reset the form and hide conditional fields
  this.reset();
  document.getElementById('serviceOther').style.display = 'none';
  document.getElementById('referralSiteDiv').style.display = 'none';
});

// Edit functionality: clicking an edit button populates the form with that row’s data and removes the row.
tableBody.addEventListener('click', function(e){
  if (e.target && e.target.classList.contains('edit-btn')) {
    const row = e.target.closest('tr');
    // Populate form fields with row data (cells index corresponds to table headers)
    document.getElementById('phone').value = row.cells[1].innerText;
    document.getElementById('date').value = row.cells[2].innerText;
    document.getElementById('time').value = row.cells[3].innerText;
    document.getElementById('callerName').value = row.cells[4].innerText;
    document.getElementById('age').value = row.cells[5].innerText;
    document.getElementById('sex').value = row.cells[6].innerText;
    document.getElementById('location').value = row.cells[7].innerText;
    document.getElementById('repName').value = row.cells[8].innerText;
    
    // Service Provided: if not one of the preset options, set to "Other"
    const service = row.cells[9].innerText;
    const serviceDropdown = document.getElementById('serviceProvided');
    if (["Consultation", "Follow-Up", "Emergency"].includes(service)) {
      serviceDropdown.value = service;
      document.getElementById('serviceOther').style.display = 'none';
      document.getElementById('serviceOther').value = "";
    } else {
      serviceDropdown.value = 'Other';
      document.getElementById('serviceOther').style.display = 'block';
      document.getElementById('serviceOther').value = service;
    }
    
    // Referral Made
    const referralMade = row.cells[10].innerText;
    document.querySelector(`input[name="referralMade"][value="${referralMade}"]`).checked = true;
    if (referralMade === 'Yes') {
      document.getElementById('referralSiteDiv').style.display = 'block';
      document.getElementById('referralSite').value = row.cells[11].innerText;
    } else {
      document.getElementById('referralSiteDiv').style.display = 'none';
      document.getElementById('referralSite').value = "";
    }
    document.getElementById('consultant').value = row.cells[12].innerText;
    document.getElementById('duration').value = row.cells[13].innerText;
    document.getElementById('summary').value = row.cells[14].innerText;
    
    // Remove the row so that when the user re-submits the form, the entry is updated
    row.remove();
  }
});

// Export to Excel functionality (CSV export)
document.getElementById('exportExcel').addEventListener('click', function(){
  let csv = [];
  const rows = document.querySelectorAll("table tr");
  // Loop through each row
  for (let i = 0; i < rows.length; i++){
    let rowData = [];
    // Exclude the Actions column (last cell)
    const cols = rows[i].querySelectorAll("th, td");
    for (let j = 0; j < cols.length - 1; j++){
      rowData.push('"' + cols[j].innerText + '"');
    }
    csv.push(rowData.join(","));
  }
  // Create a Blob from the CSV data and trigger a download
  const csvFile = new Blob([csv.join("\n")], { type: "text/csv" });
  const downloadLink = document.createElement("a");
  const currentDate = new Date().toISOString().split('T')[0];
  downloadLink.download = "HabariCallCenterRegistry_" + currentDate + ".csv";
  downloadLink.href = window.URL.createObjectURL(csvFile);
  downloadLink.style.display = "none";
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
});

// Export to PDF functionality using jsPDF and html2canvas
document.getElementById('exportPDF').addEventListener('click', function(){
  html2canvas(document.querySelector("#entriesTable")).then(canvas => {
    const imgData = canvas.toDataURL('image/png');
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    const currentDate = new Date().toISOString().split('T')[0];
    pdf.save("HabariCallCenterRegistry_" + currentDate + ".pdf");
  });
});
