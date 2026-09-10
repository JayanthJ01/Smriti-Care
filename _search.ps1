$panels = @('AppointmentsPanel','DashboardPanel','FamilyPanel','MedicinesPanel','PatientAppPanel','CognitivePanel')
$files = Get-ChildItem -Recurse -File src -Include *.tsx,*.ts
foreach ($f in $files) {
  $content = Get-Content $f.FullName -Raw
  foreach ($p in $panels) {
    if ($content -match $p -and $f.Name -ne "$p.tsx") {
      Write-Host "$($f.FullName) -> references $p"
    }
  }
}
Write-Host "--- search complete ---"
