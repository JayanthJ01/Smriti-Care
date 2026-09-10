$o = @()
$o += "===CAREGIVER_COMPONENTS==="
$o += Get-ChildItem src/components/caregiver -Name
$o += "===CAREGIVER_PAGE==="
$o += Get-Content src/pages/CaregiverPage/CaregiverPage.tsx
$o += "===CG_SHARED==="
$o += Get-Content src/components/caregiver/cgShared.tsx
$o += "===EN_TAIL==="
$o += Get-Content src/i18n/en.ts | Select-Object -Last 120
$o += "===AS_TAIL==="
$o += Get-Content src/i18n/as.ts | Select-Object -Last 120
$o += "===USED_CG_KEYS==="
Select-String -Path src/components/caregiver/*.tsx -Pattern "t\('cg\." -AllMatches | ForEach-Object { $_.Line }
$o | Out-File -Encoding UTF8 p5dump.txt
