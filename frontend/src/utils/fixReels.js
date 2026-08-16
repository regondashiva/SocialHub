import { API_URL } from '../config/api'

// Fix reel posts to have proper video URLs and mediaType
const fixReels = async () => {
  try {
    const response = await fetch(`${API_URL}/posts`);
    const posts = await response.json();
    
    // Update posts to be reels with video content
    const reelVideos = [
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTI.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouSee.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatIsPotentially.mp4'
    ];
    
    // Update first 11 posts to be reels
    const updates = posts.slice(0, 11).map((post, index) => ({
      _id: post.id,
      mediaType: 'reel',
      video: reelVideos[index],
      thumbnail: `https://picsum.photos/seed/reel${index + 1}/400/800.jpg`,
      duration: 180 + (index * 30)
    }));
    
    // Update each post
    for (const update of updates) {
      const updateResponse = await fetch(`${API_URL}/posts/${update._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OWEzZDIzMjA2OTU1Nzg2ZWE1NGJlYmYiLCJpYXQiOjE3NzIzNDY4NTksImV4cCI6MTc3MjkxNjU5OX0.pEJsTESjEtKfahQ7OnLKIRMvFFH_yITNPbInPLAkcaE'
        },
        body: JSON.stringify(update)
      });
      
      if (updateResponse.ok) {
        console.log(`✅ Updated post ${update._id} to be a reel`);
      } else {
        console.error(`❌ Failed to update post ${update._id}`);
      }
    }
    
    console.log('✅ All reel posts updated successfully!');
    
  } catch (error) {
    console.error('❌ Error fixing reels:', error);
  }
};

fixReels();
