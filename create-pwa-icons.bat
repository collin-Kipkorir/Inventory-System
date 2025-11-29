cd /d "d:\Typescrips Vscode Projects\sms-inventory\pact-inventory\public"

REM Create screenshots directory
if not exist screenshots mkdir screenshots

REM Create minimal 1x1 PNG (blue pixel) by decoding base64
REM This is a valid 1x1 PNG file encoded in base64
set PNG_BASE64=iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd3PnAAAADElEQVQI12P4z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==

REM Decode and save files
for %%F in (icon.png icon.png icon.png icon.png) do (
  powershell -Command "[System.Convert]::FromBase64String('%PNG_BASE64%') | Set-Content -Path '%%F' -Encoding Byte"
  echo Created %%F
)

for %%F in (screenshots\screenshot-192.png screenshots\screenshot-512.png) do (
  powershell -Command "[System.Convert]::FromBase64String('%PNG_BASE64%') | Set-Content -Path '%%F' -Encoding Byte"
  echo Created %%F
)

echo Done!
