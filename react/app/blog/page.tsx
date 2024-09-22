import React from 'react';

import Footer from '../../components/Footer';

const Page: React.FC = () => {
  return (
    <div>
      <div className="container px-6 mx-auto max-w-3xl overflow-hidden md:overflow-visible ">
        <div className="text-center">
          <h2 className="text-4xl font-bold my-8">
            My Geospatial Journey: An Eras Tour of Spatial Lab
          </h2>
          <div className="flex items-center mb-12">
            <img
              src="https://storage.googleapis.com/spatiallab-blog/zach-profile.jpg"
              alt="Zach FlandersProfile Picture"
              className="rounded-full h-12 w-12 mr-4"
            />
            <div className="text-left">
              <p className="font-bold">Zach Flanders</p>{' '}
              <p className="text-gray-500 italic">September 21, 2024</p>
            </div>
          </div>
        </div>
        <h3 className="text-lg font-bold mt-6 mb-4">
          My Urban Planning Era (2010-2015)
        </h3>
        <div className="flex justify-center">
          <img
            src="https://storage.googleapis.com/spatiallab-blog/kc-streetcar-model.png"
            alt="Kansas City streetcar model"
            className="mt-4 mb-8 rounded-lg shadow-lg"
            style={{ maxWidth: '100%', width: '600px', height: 'auto' }}
          />
        </div>
        <p className="mb-8">
          Over a decade ago, I was working as an urban planner. One of my
          favorite projects was assisting Kansas City in exploring options for
          expanding its streetcar line. The starter line was still under
          construction, and there was a ton of excitement about where the
          streetcar could go next. To engage the community, we held a large
          meeting at Union Station, where we built a giant, 3D model of
          downtown. Attendees were given lengths of yarn representing the amount
          of track that could be constructed, and they placed their yarn along
          the streets where they thought the streetcar should run. This
          hands-on, visual approach helped generate consensus on a few key
          routes with the most potential. It was a powerful experience that{' '}
          <span className="bg-yellow-100">
            showed me the importance of spatial data in decision-making
          </span>
          .
        </p>
        <h3 className="font-bold my-4 text-lg">
          My Bootstrapping Era (2015-2019)
        </h3>
        <div className="flex justify-center">
          <img
            src="https://storage.googleapis.com/spatiallab-blog/mapalize.jpg"
            alt="Mapalize"
            className="my-12 rounded-lg shadow-lg z-10"
            style={{
              maxWidth: '100%',
              width: '500px',
              transform: 'rotate(-5deg) translateX(20px)',
            }}
          />
          <img
            src="https://storage.googleapis.com/spatiallab-blog/olathe-bike-share.jpg"
            alt="Olathe Bike Share"
            className="my-12 rounded-lg shadow-lg z-0"
            style={{
              maxWidth: '100%',
              width: '500px',
              transform: 'rotate(5deg) translateX(-20px)',
            }}
          />
        </div>
        <p className="mb-8">
          The excitement from that streetcar project sparked an idea: What if we
          could replicate that 3D model experience using online maps? I searched
          for software that could do this but found nothing that quite fit the
          bill. So, I decided to build it myself. While I had some programming
          experience (thanks to coding competitions in high school), I needed to{' '}
          <span className="bg-yellow-100">
            teach myself how to create a full web application
          </span>
          . It was challenging, but ultimately, I launched a platform, gained
          some local government clients, and gathered hundreds of ideas for bike
          infrastructure around Kansas City—and it didn&apos;t crash, which was
          a win in itself!
        </p>

        <h3 className="font-bold my-4 text-lg">
          My Software Engineering Era (2019-2024)
        </h3>
        <p className="mb-8">
          Teaching myself the basics of software development inspired me to take
          the leap and pursue a full-time career as a software engineer. Over
          the next several years, I honed my skills working on a team that used
          geospatial data to solve problems for fire departments, health
          departments, and local governments. This was my era of{' '}
          <span className="bg-yellow-100">
            learning how to build robust infrastructure and work with complex
            datasets
          </span>
          . The experience was invaluable, and it gave me the foundation I
          needed to think bigger about what geospatial tools could accomplish.
        </p>

        <h3 className="font-bold my-4 text-lg">My Spatial Lab Era</h3>
        <div className="flex justify-center">
          <img
            src="https://storage.googleapis.com/spatiallab-blog/spatial-lab-data.png"
            alt="Spatial Lab"
            className="my-12 rounded-lg shadow-lg"
            style={{ maxWidth: '100%', width: '600px', height: 'auto' }}
          />
        </div>
        <p className="mb-8">
          All of these experiences have culminated in Spatial Lab—a GIS platform
          that reflects my vision for how geospatial technology should work. My
          goal is to build{' '}
          <span className="bg-yellow-100">
            a platform that you will love to use
          </span>
          . What makes Spatial Lab different is its focus on being well-designed
          and simple to use while still offering the full range of tools GIS
          professionals need. I believe that powerful tools don&apos;t have to
          be overwhelming. You should be able to enjoy the map-making process
          without sacrificing functionality, and that&apos;s the mission driving
          Spatial Lab.
        </p>

        <p className="mt-8 mb-24">
          It&apos;s still early days in the Spatial Lab journey, and I&apos;m
          excited about the possibilities ahead. If you share my passion for
          maps and GIS, I&apos;d love for you to join me on this adventure. Help
          put Spatial Lab on the map by sharing it with your network—together,
          we can shape the future of GIS.
        </p>
      </div>
      <Footer />
    </div>
  );
};

export default Page;
