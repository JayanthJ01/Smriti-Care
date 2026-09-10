$o = @()
$o += '===CAREGIVER_COMPONENTS==='
$o += (Get-ChildItem src/components/caregiver -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Name)
$o += '---PAGE---'
$o += (Get-ChildItem src/pages/CaregiverPage -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Name)
$o += '---CG_EN_COUNT---'
$en = (Select-String -Path src/i18n/en.ts -Pattern "'cg\." -AllMatches).Matches.Count
$o += $en
$o += '---CG_AS_COUNT---'
$as = (Select-String -Path src/i18n/as.ts -Pattern "'cg\." -AllMatches).Matches.Count
$o += $as
$o | Out-File -FilePath p5final.txt -Encoding utf8
