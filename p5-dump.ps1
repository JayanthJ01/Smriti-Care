$ErrorActionPreference = 'SilentlyContinue'
Set-Location 'c:/Users/owner/Desktop/SIH'
$o = @()
$o += '===DIR==='
$o += (Get-ChildItem src/components/caregiver -Name)
$o += '===MUTATIONS==='
Select-String -Path src/contexts/PatientDataContext.tsx -Pattern 'addMedicine|updateMedicine|removeMedicine|toggleMedicineActive|setHydrationTarget|addAppointment|updateAppointment|removeAppointment|selectPatient|selectedPatientId' | ForEach-Object { "$($_.LineNumber): $($_.Line.Trim())" }
$o += '===ENGINE_EXPORTS==='
Select-String -Path src/services/adaptive/adaptiveEngine.ts, src/services/adaptive/adaptiveConfig.ts -Pattern '^export' | ForEach-Object { "$($_.Filename): $($_.Line)" }
$o += '===CGKEYS_EN_COUNT===';
$o += (Select-String -Path src/i18n/en.ts -Pattern "'cg\.").Count
$o += '===USED_CGKEYS==='
Get-ChildItem src/components/caregiver/*.tsx | ForEach-Object { (Select-String -Path $_.FullName -Pattern "t\('cg\.[a-zA-Z.]+'").Matches.Value } | Sort-Object -Unique
$o += '===I18N_TAIL==='
Get-Content src/i18n/en.ts -Tail 6
$o += '===AS_TAIL==='
Get-Content src/i18n/as.ts -Tail 6
$o += '===PANEL_HEADS==='
Get-ChildItem src/components/caregiver/*.tsx | ForEach-Object { $f=$_.Name; $lines=Get-Content $_.FullName; "---- $f ($($lines.Count) lines)"; $lines | Select-Object -First 5 }
Set-Content -Path p5-state.txt -Value $o -Encoding UTF8
Write-Host 'DUMP_OK'

$ErrorActionPreference = 'SilentlyContinue'
$o = @()
$o += '===FILES==='
$o += (Get-ChildItem src/components/caregiver -Name)
$o += '===SIGNATURES==='
Get-ChildItem src/components/caregiver/*.tsx | ForEach-Object {
  $o += ('--' + $_.Name + '--')
  $o += (Select-String -Path $_.FullName -Pattern 'export default function' | ForEach-Object { $_.Line.Trim() })
}
$o += '===CTX-SIG==='
$o += (Select-String -Path src/contexts/PatientDataContext.tsx -Pattern 'const (add|update|remove|toggle|set|save|select|reset)\w*' | ForEach-Object { $_.Line.Trim() })
$o += '===CGKEYS-USED==='
$o += (Select-String -Path src/components/caregiver/*.tsx -Pattern "t\('cg\.[a-zA-Z.]+" -AllMatches | ForEach-Object { $_.Matches | ForEach-Object { $_.Value } } | Sort-Object -Unique)
$o += '===EN-TAIL==='
$o += (Get-Content src/i18n/en.ts -Tail 6)
$o += '===AS-TAIL==='
$o += (Get-Content src/i18n/as.ts -Tail 6)
Set-Content -Path p5-state.txt -Value $o -Encoding UTF8
Write-Output 'DUMP_OK'
