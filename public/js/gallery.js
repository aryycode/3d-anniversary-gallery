// Gallery Application - React Components
const { useState, useEffect, useRef } = React;

        
// Simple Canvas Component
        function Canvas({ children, style }) {
            const canvasRef = useRef();
            const sceneRef = useRef();
            const cameraRef = useRef();
            const rendererRef = useRef();
            const frameIdRef = useRef();

            useEffect(() => {
                const scene = new THREE.Scene();
                const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
                const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

                renderer.setSize(window.innerWidth, window.innerHeight);
                renderer.setClearColor(0x000000, 0); // Transparent background
                canvasRef.current.appendChild(renderer.domElement);

                camera.position.z = 8;

                sceneRef.current = scene;
                cameraRef.current = camera;
                rendererRef.current = renderer;

                // Improve lighting for better photo visibility
                const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
                scene.add(ambientLight);

                const pointLight1 = new THREE.PointLight(0xffffff, 1.5);
                pointLight1.position.set(10, 10, 10);
                scene.add(pointLight1);

                const pointLight2 = new THREE.PointLight(0xffffff, 1);
                pointLight2.position.set(-10, -10, -10);
                scene.add(pointLight2);

                const pointLight3 = new THREE.PointLight(0xffffff, 0.8);
                pointLight3.position.set(0, 0, 10);
                scene.add(pointLight3);

                const handleResize = () => {
                    camera.aspect = window.innerWidth / window.innerHeight;
                    camera.updateProjectionMatrix();
                    renderer.setSize(window.innerWidth, window.innerHeight);
                };

                window.addEventListener('resize', handleResize);

                const animate = () => {
                    frameIdRef.current = requestAnimationFrame(animate);
                    renderer.render(scene, camera);
                };
                animate();

                return () => {
                    window.removeEventListener('resize', handleResize);
                    cancelAnimationFrame(frameIdRef.current);
                    renderer.dispose();
                };
            }, []);

            return (
                <div ref={canvasRef} style={style}>
                    {React.Children.map(children, child =>
                        React.cloneElement(child, { scene: sceneRef.current, camera: cameraRef.current })
                    )}
                </div>
            );
        }

        // Photo Frame Component
        function PhotoFrame({ photo, index, onClick, isActive, scene }) {
            const meshRef = useRef();
            const borderRef = useRef();
            const captionRef = useRef();

            // Create mesh only once when scene and photo are available
            useEffect(() => {
                if (!scene) return;

                const loader = new THREE.TextureLoader();

                loader.load(
                    photo.image,
                    (texture) => {
                        console.log('Texture loaded for photo', index, 'at position', photo.position);

                        // Calculate aspect ratio from texture
                        const aspectRatio = texture.image.width / texture.image.height;
                        const photoHeight = 2;
                        const photoWidth = photoHeight * aspectRatio;

                        // Create geometry with proper aspect ratio
                        const geometry = new THREE.PlaneGeometry(photoWidth, photoHeight);

                        // Use MeshBasicMaterial to avoid lighting effects (no filters)
                        const material = new THREE.MeshBasicMaterial({
                            map: texture,
                            side: THREE.DoubleSide
                        });

                        const mesh = new THREE.Mesh(geometry, material);
                        mesh.position.set(...photo.position);
                        mesh.rotation.set(...photo.rotation);
                        mesh.userData = { photoId: photo.id, index };

                        // Add border
                        const edges = new THREE.EdgesGeometry(geometry);
                        const lineMaterial = new THREE.LineBasicMaterial({
                            color: isActive ? 0xffd700 : 0xcccccc,
                            linewidth: 2
                        });
                        const border = new THREE.LineSegments(edges, lineMaterial);
                        mesh.add(border);

                        // Add caption as 3D text sprite if caption exists
                        if (photo.caption) {
                            const canvas = document.createElement('canvas');
                            const context = canvas.getContext('2d');
                            canvas.width = 512;
                            canvas.height = 128;

                            // Beautiful font styling
                            context.fillStyle = 'rgba(0, 0, 0, 0.8)';
                            context.fillRect(0, 0, canvas.width, canvas.height);

                            context.fillStyle = '#ffffff';
                            context.font = 'italic 28px "Georgia", "Palatino", serif';
                            context.textAlign = 'center';
                            context.textBaseline = 'middle';

                            // Word wrap for long captions
                            const maxWidth = canvas.width - 40;
                            const words = photo.caption.split(' ');
                            let line = '';
                            let y = canvas.height / 2;

                            // Simple word wrap
                            const lines = [];
                            for (let word of words) {
                                const testLine = line + word + ' ';
                                const metrics = context.measureText(testLine);
                                if (metrics.width > maxWidth && line !== '') {
                                    lines.push(line);
                                    line = word + ' ';
                                } else {
                                    line = testLine;
                                }
                            }
                            lines.push(line);

                            // Draw lines
                            const lineHeight = 32;
                            const startY = (canvas.height - (lines.length * lineHeight)) / 2 + lineHeight / 2;
                            lines.forEach((line, i) => {
                                context.fillText(line.trim(), canvas.width / 2, startY + i * lineHeight);
                            });

                            const texture = new THREE.CanvasTexture(canvas);
                            const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
                            const sprite = new THREE.Sprite(spriteMaterial);

                            // Position caption below the photo
                            sprite.position.set(0, -photoHeight / 2 - 0.5, 0);
                            sprite.scale.set(photoWidth * 0.8, photoWidth * 0.8 * 0.25, 1);

                            mesh.add(sprite);
                            captionRef.current = sprite;
                        }

                        meshRef.current = mesh;
                        borderRef.current = border;
                        scene.add(mesh);
                        console.log('Mesh added to scene. Total objects in scene:', scene.children.length);
                    },
                    undefined,
                    (error) => {
                        console.error('Error loading texture for photo', index, ':', error);
                    }
                );

                return () => {
                    if (meshRef.current) {
                        scene.remove(meshRef.current);
                        meshRef.current.geometry.dispose();
                        meshRef.current.material.dispose();
                        if (borderRef.current) {
                            borderRef.current.geometry.dispose();
                            borderRef.current.material.dispose();
                        }
                        if (captionRef.current) {
                            captionRef.current.material.dispose();
                            captionRef.current.material.map.dispose();
                        }
                    }
                };
            }, [scene, photo]);

            // Update border when active state changes
            useEffect(() => {
                if (borderRef.current && borderRef.current.material) {
                    borderRef.current.material.color.setHex(isActive ? 0xffd700 : 0xcccccc);
                }
            }, [isActive]);

            return null;
        }

        // Scene Component
        function Scene({ photos, activeIndex, onPhotoClick, scene, camera, onNavigate }) {
            const controlsRef = useRef();
            const isDragging = useRef(false);
            const isCtrlPressed = useRef(false);
            const previousMousePosition = useRef({ x: 0, y: 0 });
            const initialPinchDistance = useRef(null);
            const viewingDistanceRef = useRef(8);

            // Swipe detection
            const swipeStartRef = useRef(null);
            const swipeTimeRef = useRef(0);

            // Orbit camera state
            const targetRef = useRef(new THREE.Vector3(0, 0, 0)); // What we're looking at
            const sphericalRef = useRef({
                radius: 8,
                theta: 0,    // horizontal angle
                phi: Math.PI / 2  // vertical angle (90 degrees = eye level)
            });

            // Update camera position from spherical coordinates
            const updateCameraPosition = () => {
                const { radius, theta, phi } = sphericalRef.current;
                const target = targetRef.current;

                // Convert spherical to cartesian coordinates
                const x = target.x + radius * Math.sin(phi) * Math.sin(theta);
                const y = target.y + radius * Math.cos(phi);
                const z = target.z + radius * Math.sin(phi) * Math.cos(theta);

                camera.position.set(x, y, z);
                camera.lookAt(target);
            };

            useEffect(() => {
                if (!scene || !camera) return;

                // Initialize camera position
                updateCameraPosition();

                const raycaster = new THREE.Raycaster();
                const mouse = new THREE.Vector2();

                const handleMouseDown = (e) => {
                    isDragging.current = true;
                    isCtrlPressed.current = e.ctrlKey || e.metaKey; // metaKey for Mac Cmd
                    previousMousePosition.current = { x: e.clientX, y: e.clientY };
                    swipeStartRef.current = { x: e.clientX, y: e.clientY };
                    swipeTimeRef.current = Date.now();
                    document.body.style.cursor = 'grabbing';
                };

                const handleMouseMove = (e) => {
                    if (isDragging.current) {
                        const deltaX = e.clientX - previousMousePosition.current.x;
                        const deltaY = e.clientY - previousMousePosition.current.y;

                        if (isCtrlPressed.current) {
                            // Ctrl + drag: Orbit controls (rotate camera around target)
                            sphericalRef.current.theta -= deltaX * 0.005; // Horizontal rotation
                            sphericalRef.current.phi -= deltaY * 0.005;   // Vertical rotation

                            // Clamp vertical angle to prevent flipping
                            sphericalRef.current.phi = Math.max(0.1, Math.min(Math.PI - 0.1, sphericalRef.current.phi));

                            updateCameraPosition();
                        } else {
                            // Regular drag: Pan controls (move camera and target together)
                            const panSpeed = 0.02;

                            // Get camera's right and up vectors for proper panning
                            const cameraRight = new THREE.Vector3();
                            const cameraUp = new THREE.Vector3();

                            camera.getWorldDirection(cameraRight);
                            cameraRight.cross(camera.up).normalize();
                            cameraUp.copy(camera.up).normalize();

                            // Calculate pan offset
                            const panOffset = new THREE.Vector3();
                            panOffset.addScaledVector(cameraRight, -deltaX * panSpeed);
                            panOffset.addScaledVector(cameraUp, deltaY * panSpeed);

                            // Move both camera and target by the same amount (free-roam pan)
                            camera.position.add(panOffset);
                            targetRef.current.add(panOffset);
                        }

                        previousMousePosition.current = { x: e.clientX, y: e.clientY };
                    }
                };

                const handleMouseUp = (e) => {
                    if (swipeStartRef.current) {
                        const swipeEnd = { x: e.clientX, y: e.clientY };
                        const deltaX = swipeEnd.x - swipeStartRef.current.x;
                        const deltaY = swipeEnd.y - swipeStartRef.current.y;
                        const swipeTime = Date.now() - swipeTimeRef.current;

                        // Check if it's a swipe (quick, mostly horizontal movement)
                        const isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY) * 2; // More horizontal than vertical
                        const isQuickSwipe = swipeTime < 300; // Less than 300ms
                        const isLongEnoughSwipe = Math.abs(deltaX) > 50; // At least 50px

                        if (isHorizontalSwipe && isQuickSwipe && isLongEnoughSwipe && onNavigate) {
                            if (deltaX > 0) {
                                // Swipe right = previous
                                onNavigate('prev');
                            } else {
                                // Swipe left = next
                                onNavigate('next');
                            }
                        }

                        swipeStartRef.current = null;
                    }
                    isDragging.current = false;
                    // Restore cursor based on Ctrl key state
                    document.body.style.cursor = (e.ctrlKey || e.metaKey) ? 'grab' : 'move';
                };

                const handleClick = (e) => {
                    if (isDragging.current) return;

                    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
                    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

                    raycaster.setFromCamera(mouse, camera);
                    const intersects = raycaster.intersectObjects(scene.children, true);

                    if (intersects.length > 0) {
                        const object = intersects[0].object;
                        if (object.userData.index !== undefined) {
                            onPhotoClick(object.userData.index);
                        }
                    }
                };

                const handleWheel = (e) => {
                    e.preventDefault();

                    // Free zoom: move camera forward/backward in viewing direction
                    // This allows passing through photos and exploring the space
                    const zoomSpeed = 0.5;
                    const direction = new THREE.Vector3();
                    camera.getWorldDirection(direction);
                    direction.normalize();

                    // Move camera forward (negative deltaY) or backward (positive deltaY)
                    const zoomDelta = -e.deltaY * zoomSpeed * 0.01;
                    camera.position.addScaledVector(direction, zoomDelta);

                    // Also update the spherical radius to match the new distance from target
                    const distanceToTarget = camera.position.distanceTo(targetRef.current);
                    sphericalRef.current.radius = distanceToTarget;
                };

                // Touch support with pinch-to-zoom
                const getTouchDistance = (touch1, touch2) => {
                    const dx = touch1.clientX - touch2.clientX;
                    const dy = touch1.clientY - touch2.clientY;
                    return Math.sqrt(dx * dx + dy * dy);
                };

                const handleTouchStart = (e) => {
                    if (e.touches.length === 1) {
                        isDragging.current = true;
                        previousMousePosition.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
                        swipeStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
                        swipeTimeRef.current = Date.now();
                    } else if (e.touches.length === 2) {
                        // Pinch gesture started
                        isDragging.current = false;
                        swipeStartRef.current = null;
                        initialPinchDistance.current = getTouchDistance(e.touches[0], e.touches[1]);
                    }
                };

                const handleTouchMove = (e) => {
                    e.preventDefault();

                    if (e.touches.length === 1 && isDragging.current) {
                        // Single finger drag - pan the camera (move around the space)
                        const deltaX = e.touches[0].clientX - previousMousePosition.current.x;
                        const deltaY = e.touches[0].clientY - previousMousePosition.current.y;

                        // Pan controls (move camera and target together)
                        const panSpeed = 0.02;

                        // Get camera's right and up vectors for proper panning
                        const cameraRight = new THREE.Vector3();
                        const cameraUp = new THREE.Vector3();

                        camera.getWorldDirection(cameraRight);
                        cameraRight.cross(camera.up).normalize();
                        cameraUp.copy(camera.up).normalize();

                        // Calculate pan offset
                        const panOffset = new THREE.Vector3();
                        panOffset.addScaledVector(cameraRight, -deltaX * panSpeed);
                        panOffset.addScaledVector(cameraUp, deltaY * panSpeed);

                        // Move both camera and target by the same amount (free-roam pan)
                        camera.position.add(panOffset);
                        targetRef.current.add(panOffset);

                        previousMousePosition.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
                    } else if (e.touches.length === 2 && initialPinchDistance.current !== null) {
                        // Pinch gesture - zoom in/out
                        const currentDistance = getTouchDistance(e.touches[0], e.touches[1]);
                        const delta = initialPinchDistance.current - currentDistance;

                        // Free zoom: move camera forward/backward in viewing direction
                        const zoomSpeed = 0.5;
                        const direction = new THREE.Vector3();
                        camera.getWorldDirection(direction);
                        direction.normalize();

                        // Move camera (pinch in = zoom in/forward, pinch out = zoom out/backward)
                        const zoomDelta = -delta * zoomSpeed * 0.001;
                        camera.position.addScaledVector(direction, zoomDelta);

                        // Update the spherical radius to match the new distance from target
                        const distanceToTarget = camera.position.distanceTo(targetRef.current);
                        sphericalRef.current.radius = distanceToTarget;

                        initialPinchDistance.current = currentDistance;
                    }
                };

                const handleTouchEnd = (e) => {
                    if (swipeStartRef.current && e.changedTouches.length > 0) {
                        const touch = e.changedTouches[0];
                        const swipeEnd = { x: touch.clientX, y: touch.clientY };
                        const deltaX = swipeEnd.x - swipeStartRef.current.x;
                        const deltaY = swipeEnd.y - swipeStartRef.current.y;
                        const swipeTime = Date.now() - swipeTimeRef.current;

                        // Check if it's a swipe (quick, mostly horizontal movement)
                        const isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY) * 2;
                        const isQuickSwipe = swipeTime < 300;
                        const isLongEnoughSwipe = Math.abs(deltaX) > 50;

                        if (isHorizontalSwipe && isQuickSwipe && isLongEnoughSwipe && onNavigate) {
                            if (deltaX > 0) {
                                // Swipe right = previous
                                onNavigate('prev');
                            } else {
                                // Swipe left = next
                                onNavigate('next');
                            }
                        }

                        swipeStartRef.current = null;
                    }
                    isDragging.current = false;
                    initialPinchDistance.current = null;
                };

                // Keyboard events for Ctrl key detection
                const handleKeyDown = (e) => {
                    if (e.ctrlKey || e.metaKey) {
                        document.body.style.cursor = 'grab';
                    }
                };

                const handleKeyUp = (e) => {
                    if (!e.ctrlKey && !e.metaKey) {
                        document.body.style.cursor = isDragging.current ? 'grabbing' : 'move';
                    }
                };

                document.addEventListener('mousedown', handleMouseDown);
                document.addEventListener('mousemove', handleMouseMove);
                document.addEventListener('mouseup', handleMouseUp);
                document.addEventListener('click', handleClick);
                document.addEventListener('wheel', handleWheel, { passive: false });
                document.addEventListener('touchstart', handleTouchStart, { passive: false });
                document.addEventListener('touchmove', handleTouchMove, { passive: false });
                document.addEventListener('touchend', handleTouchEnd, { passive: true });
                document.addEventListener('keydown', handleKeyDown);
                document.addEventListener('keyup', handleKeyUp);

                // Set initial cursor
                document.body.style.cursor = 'move';

                return () => {
                    document.removeEventListener('mousedown', handleMouseDown);
                    document.removeEventListener('mousemove', handleMouseMove);
                    document.removeEventListener('mouseup', handleMouseUp);
                    document.removeEventListener('click', handleClick);
                    document.removeEventListener('wheel', handleWheel);
                    document.removeEventListener('touchstart', handleTouchStart);
                    document.removeEventListener('touchmove', handleTouchMove);
                    document.removeEventListener('touchend', handleTouchEnd);
                    document.removeEventListener('keydown', handleKeyDown);
                    document.removeEventListener('keyup', handleKeyUp);
                    document.body.style.cursor = 'default';
                };
            }, [scene, camera, onPhotoClick]);

            // Removed auto-camera animation to active photo
            // This allows free exploration without snapping back to active image

            return (
                <>
                    {photos.map((photo, index) => (
                        <PhotoFrame
                            key={photo.id}
                            photo={photo}
                            index={index}
                            onClick={() => onPhotoClick(index)}
                            isActive={activeIndex === index}
                            scene={scene}
                        />
                    ))}
                </>
            );
        }

        

// Main App Component
        function App() {
            const [photos, setPhotos] = useState([]);
            const [activeIndex, setActiveIndex] = useState(null);
            
            const [loading, setLoading] = useState(true);

            useEffect(() => {
                
                loadPhotos();
            }, []);

            const loadPhotos = async () => {
        try {
            const loadedPhotos = await GalleryAPI.getPhotos();
            console.log('Loaded photos from server:', loadedPhotos.length);
            setPhotos(loadedPhotos);
            
            // Auto-show first photo on load
            if (loadedPhotos.length > 0) {
                setTimeout(() => {
                    console.log('Setting active index to 0');
                    setActiveIndex(0);
                }, 100);
            }
        } catch (error) {
            console.log('Error loading photos:', error);
        }
        setLoading(false);
    };

            const handleNext = () => {
                if (photos.length === 0) return;
                setActiveIndex((prev) => {
                    const newIndex = prev === null ? 0 : (prev + 1) % photos.length;
                    console.log('handleNext: prev =', prev, ', new =', newIndex);
                    return newIndex;
                });
            };

            const handlePrev = () => {
                if (photos.length === 0) return;
                setActiveIndex((prev) => {
                    const newIndex = prev === null ? photos.length - 1 : (prev - 1 + photos.length) % photos.length;
                    console.log('handlePrev: prev =', prev, ', new =', newIndex);
                    return newIndex;
                });
            };

            useEffect(() => {
                const handleKeyDown = (e) => {
                    if (e.key === 'ArrowRight') handleNext();
                    if (e.key === 'ArrowLeft') handlePrev();
                };
                window.addEventListener('keydown', handleKeyDown);
                return () => window.removeEventListener('keydown', handleKeyDown);
            }, [photos.length]);

            if (loading) {
                return (
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '100vh',
                        backgroundColor: '#000',
                        color: 'white'
                    }}>Loading...</div>
                );
            }

            return (
                <div style={{ width: '100vw', height: '100vh', position: 'relative', backgroundColor: '#000' }}>
                    {photos.length === 0 ? (
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            height: '100vh',
                            color: 'white',
                            gap: '20px'
                        }}>
                            <h2>Belum ada foto</h2>
                            <a
                                href="/admin?admin=aryy"
                                style={{
                                    padding: '15px 30px',
                                    backgroundColor: '#007bff',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '5px',
                                    cursor: 'pointer',
                                    fontSize: '16px',
                                    textDecoration: 'none',
                                    display: 'inline-block'
                                }}
                            >
                                Tambah Foto
                            </a>
                        </div>
                    ) : (
                        <>
                            {/* Romantic Background */}
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                background: 'linear-gradient(135deg, #1a0a1e 0%, #2d1b3d 25%, #1e0a1a 50%, #3d1b2d 75%, #1a0a1e 100%)',
                                zIndex: 0
                            }}>
                                {/* Floating Hearts */}
                                {[...Array(20)].map((_, i) => (
                                    <div key={i} style={{
                                        position: 'absolute',
                                        left: `${Math.random() * 100}%`,
                                        top: `${Math.random() * 100}%`,
                                        fontSize: `${Math.random() * 20 + 10}px`,
                                        opacity: Math.random() * 0.3 + 0.1,
                                        animation: `float ${Math.random() * 10 + 10}s infinite ease-in-out`,
                                        animationDelay: `${Math.random() * 5}s`
                                    }}>
                                        ❤
                                    </div>
                                ))}
                                {/* Stars */}
                                {[...Array(50)].map((_, i) => (
                                    <div key={`star-${i}`} style={{
                                        position: 'absolute',
                                        left: `${Math.random() * 100}%`,
                                        top: `${Math.random() * 100}%`,
                                        width: '2px',
                                        height: '2px',
                                        backgroundColor: 'white',
                                        borderRadius: '50%',
                                        opacity: Math.random() * 0.5 + 0.3,
                                        animation: `twinkle ${Math.random() * 3 + 2}s infinite ease-in-out`,
                                        animationDelay: `${Math.random() * 3}s`
                                    }} />
                                ))}
                            </div>

                            <Canvas style={{ position: 'relative', zIndex: 1 }}>
                                <Scene
                                    photos={photos}
                                    activeIndex={activeIndex}
                                    onPhotoClick={setActiveIndex}
                                    onNavigate={(direction) => {
                                        if (direction === 'next') {
                                            handleNext();
                                        } else if (direction === 'prev') {
                                            handlePrev();
                                        }
                                    }}
                                />
                            </Canvas>

                            <div style={{
                                position: 'absolute',
                                bottom: '30px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                display: 'flex',
                                gap: '15px',
                                zIndex: 10
                            }}>
                                <button
                                    onClick={handlePrev}
                                    style={{
                                        padding: '12px 24px',
                                        backgroundColor: 'rgba(255,255,255,0.2)',
                                        color: 'white',
                                        border: '2px solid white',
                                        borderRadius: '50px',
                                        cursor: 'pointer',
                                        fontSize: '16px',
                                        backdropFilter: 'blur(10px)'
                                    }}
                                >
                                    ← Previous
                                </button>
                                <button
                                    onClick={handleNext}
                                    style={{
                                        padding: '12px 24px',
                                        backgroundColor: 'rgba(255,255,255,0.2)',
                                        color: 'white',
                                        border: '2px solid white',
                                        borderRadius: '50px',
                                        cursor: 'pointer',
                                        fontSize: '16px',
                                        backdropFilter: 'blur(10px)'
                                    }}
                                >
                                    Next →
                                </button>
                            </div>

                            {activeIndex !== null && (
                                <div style={{
                                    position: 'absolute',
                                    top: '20px',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    padding: '10px 20px',
                                    backgroundColor: 'rgba(0,0,0,0.5)',
                                    color: 'white',
                                    borderRadius: '20px',
                                    backdropFilter: 'blur(10px)',
                                    zIndex: 10
                                }}>
                                    {activeIndex + 1} / {photos.length}
                                </div>
                            )}

                            {/* Controls Help */}
                            <div style={{
                                position: 'absolute',
                                top: '70px',
                                left: '20px',
                                padding: '12px 16px',
                                backgroundColor: 'rgba(0,0,0,0.4)',
                                color: 'white',
                                borderRadius: '10px',
                                backdropFilter: 'blur(10px)',
                                fontSize: '13px',
                                lineHeight: '1.6',
                                zIndex: 10,
                                fontFamily: 'monospace'
                            }}>
                                <div><strong>Controls:</strong></div>
                                <div>🖱️ Drag - Pan (move around)</div>
                                <div>🖱️ Ctrl+Drag - Rotate view</div>
                                <div>🔍 Scroll - Zoom in/out</div>
                                <div>⌨️ ←/→ - Navigate photos</div>
                            </div>
                        </>
                    )}
                </div>
            );
        }

        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(<App />);