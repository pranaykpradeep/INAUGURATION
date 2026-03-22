/**
 * LAB INAUGURATION APPS SCRIPT
 * 
 * 1. Go to https://script.google.com/ and create a new project.
 * 2. Paste this code, overwriting the default function.
 * 3. Click "Deploy" -> "New deployment"
 * 4. Select type "Web app"
 * 5. Execute as: "Me"
 * 6. Who has access: "Anyone"
 * 7. Click "Deploy" and authorize it.
 * 8. COPY the "Web app URL" and paste it into script.js line 10!
 */

function doGet(e) {
  var action = e.parameter.action;
  var props = PropertiesService.getScriptProperties();
  var triggeredAt = Number(props.getProperty('triggeredAt') || '0');
  var after = Number(e.parameter.after || '0');
  
  // Return current status only for fresh trigger requests.
  if (action === 'status') {
    var isFresh = triggeredAt > 0 && triggeredAt >= after;
    return ContentService.createTextOutput(JSON.stringify({
      triggered: isFresh,
      triggeredAt: triggeredAt
    }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  // Save the latest trigger timestamp.
  if (action === 'trigger') {
    var now = Number(e.parameter.t || Date.now());
    props.setProperty('triggeredAt', String(now));
    return ContentService.createTextOutput(JSON.stringify({success: true, triggeredAt: now}))
       .setMimeType(ContentService.MimeType.JSON);
  }
  
  // Optional: hard reset the stored trigger timestamp.
  if (action === 'reset') {
    props.deleteProperty('triggeredAt');
    return ContentService.createTextOutput(JSON.stringify({success: true}))
       .setMimeType(ContentService.MimeType.JSON);
  }

  // Fallback
  return ContentService.createTextOutput("Invalid Action = " + action);
}

// Allows accepting POST requests (e.g. if the form method changes)
function doPost(e) {
  var props = PropertiesService.getScriptProperties();
  var now = Date.now();
  props.setProperty('triggeredAt', String(now));
  return ContentService.createTextOutput(JSON.stringify({success: true, triggeredAt: now}))
    .setMimeType(ContentService.MimeType.JSON);
}
