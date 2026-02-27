#!/bin/bash

# Frame interpolation using ffmpeg minterpolate
# Creates smooth animation between start and end position images

EXERCISE_ID=$1
FRAMES_DIR="app/public/exercise-frames/$EXERCISE_ID"
IMAGES_DIR="app/public/exercise-images/$EXERCISE_ID"

if [ -z "$EXERCISE_ID" ]; then
  echo "Usage: $0 <exercise-id>"
  exit 1
fi

if [ ! -f "$IMAGES_DIR/0.png" ] || [ ! -f "$IMAGES_DIR/1.png" ]; then
  echo "Error: Images not found for $EXERCISE_ID"
  exit 1
fi

echo "Interpolating frames for $EXERCISE_ID..."

# Create frames directory
mkdir -p "$FRAMES_DIR"

# Create a video from the two images with frame interpolation
# Pad to even dimensions for h264 compatibility
ffmpeg -y \
  -loop 1 -t 1.5 -i "$IMAGES_DIR/0.png" \
  -loop 1 -t 1.5 -i "$IMAGES_DIR/1.png" \
  -loop 1 -t 1.5 -i "$IMAGES_DIR/0.png" \
  -filter_complex "\
    [0:v]pad=width=ceil(iw/2)*2:height=ceil(ih/2)*2[v0];\
    [1:v]pad=width=ceil(iw/2)*2:height=ceil(ih/2)*2[v1];\
    [2:v]pad=width=ceil(iw/2)*2:height=ceil(ih/2)*2[v2];\
    [v0][v1][v2]concat=n=3:v=1:a=0[concat];\
    [concat]minterpolate=fps=30:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1" \
  -pix_fmt yuv420p \
  "/tmp/${EXERCISE_ID}_temp.mp4"

# Extract frames from interpolated video
ffmpeg -i "/tmp/${EXERCISE_ID}_temp.mp4" \
  "$FRAMES_DIR/frame_%03d.png"

# Clean up
rm "/tmp/${EXERCISE_ID}_temp.mp4"

FRAME_COUNT=$(ls -1 "$FRAMES_DIR"/frame_*.png 2>/dev/null | wc -l | tr -d ' ')
echo "✓ Generated $FRAME_COUNT interpolated frames"
echo "  Frames saved to: $FRAMES_DIR"
