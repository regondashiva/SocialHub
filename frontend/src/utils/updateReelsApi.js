import { API_URL } from '../config/api'

// Update reel posts using the API
const updateReels = async () => {
  try {
    console.log('🔄 Fetching posts from API...');
    
    // Get all posts
    const response = await fetch(`${API_URL}/posts`);
    const posts = await response.json();
    
    console.log(`📝 Found ${posts.length} posts`);
    
    // Filter posts that need to be updated (not reels or no video)
    const postsToUpdate = posts.slice(0, 11).filter(post => 
      post.mediaType !== 'reel' || !post.video
    );
    
    console.log(`📊 Found ${postsToUpdate.length} posts to update to reels`);
    
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
    
    // Update each post to be a reel
    for (let i = 0; i < postsToUpdate.length; i++) {
      const post = postsToUpdate[i];
      
      const updateData = {
        mediaType: 'reel',
        video: reelVideos[i],
        thumbnail: `https://picsum.photos/seed/reel${i + 1}/400/800.jpg`,
        duration: 180 + (i * 30)
      };
      
      try {
        const updateResponse = await fetch(`${API_URL}/posts/${post.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OWEzZDIzMjA2OTU1Nzg2ZWE1NGJlYmYiLCJpYXQiOjE3NzIzNDY4NTksImV4cCI6MTc3MjkxNjU5OX0.pEJsTESjEtKfahQ7OnLKIRMvFFH_yITNPbInPLAkcaE'
          },
          body: JSON.stringify(updateData)
        });
        
        if (updateResponse.ok) {
          console.log(`✅ Updated post ${post.id} with video: ${reelVideos[i]}`);
        } else {
          console.error(`❌ Failed to update post ${post.id}: ${updateResponse.status}`);
        }
      } catch (error) {
        console.error(`❌ Error updating post ${post.id}:`, error.message);
      }
    }
    
    console.log('🎉 Reel update process completed!');
    
    // Verify the updates
    const verifyResponse = await fetch(`${API_URL}/posts`);
    const updatedPosts = await verifyResponse.json();
    const reelPosts = updatedPosts.filter(post => post.mediaType === 'reel');
    
    console.log(`📊 Now have ${reelPosts.length} reel posts in database`);
    
    reelPosts.forEach((post, index) => {
      console.log(`🎬 Reel ${index + 1}: ${post.caption ? post.caption.substring(0, 30) + '...' : 'No caption'} | Video: ${post.video ? '✅' : '❌'}`);
    });
    
  } catch (error) {
    console.error('❌ Error updating reels:', error);
  }
};

updateReels();
