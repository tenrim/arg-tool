; Keep the directory name used by the previous one-click installer.
!undef APP_FILENAME
!define APP_FILENAME "${APP_PACKAGE_NAME}"

!macro customWelcomePage
  !insertmacro MUI_PAGE_WELCOME
!macroend
