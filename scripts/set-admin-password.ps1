param([switch]$PrepareOnly)
$ErrorActionPreference = 'Stop'
$OutputEncoding = [System.Text.UTF8Encoding]::new($false)
Set-Location -LiteralPath (Split-Path -Parent $PSScriptRoot)
Write-Host 'Set a NEW non-empty local admin password (up to 128 characters). Do not reuse passwords sent in chat.'
$adminPasswordSecure = Read-Host 'New password' -AsSecureString
$adminPasswordConfirmSecure = Read-Host 'Confirm password' -AsSecureString
$adminPasswordPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($adminPasswordSecure)
$adminConfirmPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($adminPasswordConfirmSecure)
try {
 $adminPasswordValue = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($adminPasswordPointer)
 $adminConfirmValue = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($adminConfirmPointer)
 if ($adminPasswordValue -cne $adminConfirmValue) { throw 'Passwords do not match.' }
 @{ password = $adminPasswordValue } | ConvertTo-Json -Compress | node scripts/admin-password.mjs
 if ($LASTEXITCODE -ne 0) { throw 'Credential preparation failed.' }
} finally {
 [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($adminPasswordPointer)
 [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($adminConfirmPointer)
 $adminPasswordValue = $null
 $adminConfirmValue = $null
}
if ($PrepareOnly) { Write-Host 'Preparation only. No database changed; remote import requires separate approval.'; exit 0 }
$env:WRANGLER_SEND_METRICS = 'false'
$env:WRANGLER_LOG_PATH = '.wrangler/logs'
npx wrangler d1 execute seasonal-admin-local --env local --local --file .wrangler/tools/owner-password.sql
if ($LASTEXITCODE -ne 0) { throw 'Local password reset failed. Check migration; no remote database was touched.' }
Write-Host 'Local password saved. All previous local sessions revoked. This did not deploy or change remote credentials.'
