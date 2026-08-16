import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'

dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/socialmedia'

// Define Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, lowercase: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  avatar: String,
  bio: String,
  reputationScore: { type: Number, default: 100 },
  createdAt: { type: Date, default: Date.now }
})

const postSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  caption: { type: String, default: '' },
  mediaType: { type: String, enum: ['image', 'video', 'reel'], default: 'image' },
  image: { type: String, default: '' },
  video: { type: String, default: '' },
  thumbnail: { type: String, default: '' },
  duration: { type: Number, default: null },
  location: { type: String, default: '' },
  feeling: { type: String, default: '' },
  likes: { type: Number, default: 0 },
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{
    _id: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: String,
    createdAt: { type: Date, default: Date.now }
  }],
  tags: [String],
  createdAt: { type: Date, default: Date.now }
})

const storySchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  mediaType: { type: String, enum: ['image', 'video'], default: 'image' },
  url: { type: String, required: true },
  duration: { type: Number, default: 5000 },
  createdAt: { type: Date, default: Date.now }
})

const User = mongoose.models.User || mongoose.model('User', userSchema)
const Post = mongoose.models.Post || mongoose.model('Post', postSchema)
const Story = mongoose.models.Story || mongoose.model('Story', storySchema)

const workingVideos = [
  'https://www.w3schools.com/html/mov_bbb.mp4',
  'https://www.w3schools.com/html/movie.mp4',
  'https://sample-videos.com/video321/mp4/240/big_buck_bunny_240p_1mb.mp4',
  'https://sample-videos.com/video321/mp4/480/big_buck_bunny_480p_1mb.mp4'
]

const workingImages = [
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=800&fit=crop',
  'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800&h=800&fit=crop',
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=800&fit=crop',
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&h=800&fit=crop',
  'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=800&fit=crop',
  'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800&h=800&fit=crop',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=800&fit=crop',
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=800&fit=crop'
]

const avatars = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&h=120&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&h=120&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=120&h=120&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=120&h=120&fit=crop&crop=faces'
]

const userProfiles = [
  { username: 'alex_dev', name: 'Alex Johnson', bio: 'Full-stack Engineer 🚀 | React & Node.js' },
  { username: 'sophia_design', name: 'Sophia Chen', bio: 'UI/UX Designer ✨ | Crafting experiences' },
  { username: 'marcus_code', name: 'Marcus Vance', bio: 'AI & Data Science enthusiast 📊' },
  { username: 'elena_travel', name: 'Elena Rostova', bio: 'Exploring 40+ countries 🌍🌴' },
  { username: 'david_fitness', name: 'David Miller', bio: 'Fitness Coach 💪 | Daily workouts' },
  { username: 'aria_art', name: 'Aria Taylor', bio: 'Digital Illustrator & Concept Artist 🎨' },
  { username: 'leo_photo', name: 'Leo Martinez', bio: 'Street & Landscape Photographer 📸' },
  { username: 'maya_chef', name: 'Maya Patel', bio: 'Culinary artist 🍲 | Healthy recipes' },
  { username: 'sam_tech', name: 'Sam Rivera', bio: 'Gadget reviewer & Tech creator 💻' },
  { username: 'nora_music', name: 'Nora Smith', bio: 'Singer-Songwriter 🎵 | New album out now' },
  { username: 'liam_gaming', name: 'Liam Wilson', bio: 'Pro Gamer & Streamer 🎮' },
  { username: 'chloe_fashion', name: 'Chloe Dubois', bio: 'Fashion & Lifestyle Content 👠' },
  { username: 'ethan_nature', name: 'Ethan Hunt', bio: 'Nature lover & Wildlife photography 🌿' },
  { username: 'zoe_pets', name: 'Zoe Davis', bio: 'Dog mom 🐾 | Pet care tips' },
  { username: 'noah_crypto', name: 'Noah Green', bio: 'Web3 & Blockchain Builder ⚡' },
  { username: 'grace_books', name: 'Grace Lee', bio: 'Book reviewer 📚 | Literary quotes' },
  { username: 'oliver_cars', name: 'Oliver King', bio: 'Automotive enthusiast 🏎️' },
  { username: 'emma_dance', name: 'Emma Scott', bio: 'Dancer & Choreographer 💃' },
  { username: 'lucas_film', name: 'Lucas Wright', bio: 'Filmmaker & Video Creator 🎬' },
  { username: 'hannah_mind', name: 'Hannah White', bio: 'Mindfulness & Yoga practitioner 🧘' }
]

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('🌱 Connected to MongoDB for seeding...')

    // Clear existing collections
    await User.deleteMany({})
    await Post.deleteMany({})
    await Story.deleteMany({})

    // Hash password "Password123!"
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash('Password123!', salt)

    const createdUsers = []

    // Seed 20 Users
    for (let i = 0; i < userProfiles.length; i++) {
      const p = userProfiles[i]
      const email = `${p.username}@socialhub.com`
      const avatar = avatars[i % avatars.length]

      const user = new User({
        username: p.username,
        email: email,
        password: hashedPassword,
        avatar: avatar,
        bio: p.bio,
        reputationScore: 100 + i * 5
      })
      await user.save()
      createdUsers.push(user)
    }

    console.log(`✅ Seeded ${createdUsers.length} Users successfully!`)

    // Seed Posts & Reels
    const samplePosts = [
      { caption: 'Sunset vibes at the beach 🌅 #nature #sunset', mediaType: 'image', image: workingImages[0], location: 'Malibu, California' },
      { caption: 'Building SocialHub dark mode theme! 🚀🔥 #coding #dev', mediaType: 'video', video: workingVideos[0], location: 'San Francisco, CA' },
      { caption: 'Coding late night with coffee ☕💻', mediaType: 'image', image: workingImages[2], location: 'Seattle, WA' },
      { caption: 'Checking out the latest camera gear 📸 #photography', mediaType: 'image', image: workingImages[3], location: 'Tokyo, Japan' },
      { caption: 'Check out this quick reel tutorial video! 🎥✨', mediaType: 'reel', video: workingVideos[1], duration: 15, location: 'New York, NY' },
      { caption: 'Morning workout complete! Never miss a Monday 💪', mediaType: 'image', image: workingImages[1], location: 'Los Angeles, CA' },
      { caption: 'Fresh homemade pasta recipe 🍝 #foodie', mediaType: 'image', image: workingImages[5], location: 'Rome, Italy' },
      { caption: 'Epic mountain trail hike today 🏞️ #adventure', mediaType: 'reel', video: workingVideos[2], duration: 30, location: 'Swiss Alps' },
      { caption: 'Exploring city lights tonight 🌃 #cityscape', mediaType: 'image', image: workingImages[6], location: 'London, UK' },
      { caption: 'New acoustic melody in the studio 🎸🎶', mediaType: 'video', video: workingVideos[3], location: 'Nashville, TN' }
    ]

    for (let i = 0; i < samplePosts.length; i++) {
      const sample = samplePosts[i]
      const author = createdUsers[i % createdUsers.length]

      const post = new Post({
        author: author._id,
        caption: sample.caption,
        mediaType: sample.mediaType,
        image: sample.image || '',
        video: sample.video || '',
        duration: sample.duration || null,
        location: sample.location || '',
        likes: 25 + i * 45,
        comments: [
          {
            _id: new mongoose.Types.ObjectId(),
            author: createdUsers[(i + 1) % createdUsers.length]._id,
            text: 'Awesome post! 🔥',
            createdAt: new Date()
          },
          {
            _id: new mongoose.Types.ObjectId(),
            author: createdUsers[(i + 2) % createdUsers.length]._id,
            text: 'Love the aesthetic ✨',
            createdAt: new Date()
          }
        ]
      })
      await post.save()
    }

    console.log('✅ Seeded Sample Posts & Reels into MongoDB successfully!')

    // Seed Stories into MongoDB
    for (let i = 0; i < 10; i++) {
      const author = createdUsers[i]
      const isVideo = i % 2 === 1

      const story = new Story({
        author: author._id,
        mediaType: isVideo ? 'video' : 'image',
        url: isVideo ? workingVideos[i % workingVideos.length] : workingImages[i % workingImages.length],
        duration: isVideo ? 5000 : 4000
      })
      await story.save()
    }

    console.log('✅ Seeded Sample Stories into MongoDB successfully!')

    console.log('\n--- 20 USER CREDENTIALS FOR TESTING ---')
    userProfiles.forEach((p, idx) => {
      console.log(`${idx + 1}. Username: ${p.username} | Email: ${p.username}@socialhub.com | Password: Password123!`)
    })

    mongoose.disconnect()
    console.log('🎉 Database seeding complete!')
  } catch (err) {
    console.error('Seeding error:', err)
    mongoose.disconnect()
  }
}

seed()
