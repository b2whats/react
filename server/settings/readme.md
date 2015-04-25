###Nginx рестарт под макосью
sudo launchctl unload -F /Library/LaunchDaemons/homebrew.mxcl.nginx.plist
sudo launchctl load -F /Library/LaunchDaemons/homebrew.mxcl.nginx.plist