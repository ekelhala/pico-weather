# Rebuild
cd build
cmake .. -DENABLE_USB=true
make
cd ..
# Force to BOOTSEL, has to be done weirdly
picotool load nothing -F > /dev/null
# Wait for the command to execute
echo "Putting the device into BOOTSEL..."
sleep 2
# Now we are for sure in BOOTSEL, load program and restart
picotool load -x ./build/main.elf