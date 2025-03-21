
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

interface RegisterRequest {
    email: string;
    username: string;
    password: string;
    password2: string;
    phoneNumber: string;
    isManager: boolean;
}

const names = [
    "James Smith",
    "Michael Johnson",
    "William Brown",
    "David Jones",
    "Richard Davis",
    "Joseph Miller",
    "Thomas Wilson",
    "Christopher Moore",
    "Daniel Taylor",
    "Matthew Anderson"
];

function generatePhoneNumber(): string {
    // Generate a random 10-digit phone number
    return Math.floor(1000000000 + Math.random() * 9000000000).toString();
}

function generateUsername(name: string): string {
    // Convert name to lowercase and replace spaces with dots
    return name.toLowerCase().replace(/\s+/g, '.');
}

async function registerEmployee(index: number): Promise<void> {
    const randomName = names[Math.floor(Math.random() * names.length)];
    const registerData: RegisterRequest = {
        email: `employee${index + 1}@gmail.com`,
        username: generateUsername(randomName),
        password: "12345678",
        password2: "12345678",
        phoneNumber: generatePhoneNumber(),
        isManager: false
    };

    try {
        const response = await fetch(`${API_BASE_URL}/auth/register/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(registerData),
        });

        const data = await response.json();
        if (!response.ok) {
            console.error(`Failed to register employee${index + 1}:`, data.detail || data.error);
            return;
        }

        console.log(`Successfully registered employee${index + 1}:`, {
            email: registerData.email,
            username: registerData.username,
            phoneNumber: registerData.phoneNumber
        });
    } catch (error) {
        console.error(`Error registering employee${index + 1}:`, error);
    }
}

async function registerEmployees() {
    console.log('Starting employee registration...');
    
    for (let i = 0; i < 5; i++) {
        await registerEmployee(i);
        // Add a small delay between registrations to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('Employee registration completed.');
}

// Run the registration
registerEmployees().catch(console.error); 