import Branch from '../models/branchModel.js';


// Tạo chi nhánh mới
export const createBranch = async (req, res) => {
    try {
        // Dữ liệu mẫu khi gửi lên:
        // {
        //    "name": "FoodFast Quận 1",
        //    "address": "123 Nguyễn Huệ...",
        //    "location": { "type": "Point", "coordinates": [106.70, 10.77] }
        // }
        const branch = await Branch.create(req.body);
        res.status(201).json(branch);
    } catch (error) {
        res.status(400).json({ message: 'Lỗi khi tạo chi nhánh', error: error.message });
    }
};

// Lấy tất cả chi nhánh
export const getAllBranches = async (req, res) => {
    try {
        const branches = await Branch.find({});
        res.status(200).json(branches);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy danh sách chi nhánh', error: error.message });
    }
};
export const getBranchById = async (req, res) => {
    try {
        const branch = await Branch.findById(req.params.id);
        if (branch) {
            res.json(branch);
        } else {
            res.status(404).json({ message: 'Không tìm thấy chi nhánh' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};
// Tìm chi nhánh gần nhất
// URL gọi từ Gateway: GET /api/branches/nearest?lat=...&lng=...
export const findNearestBranch = async (req, res) => {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
        return res.status(400).json({ message: 'Vui lòng cung cấp tham số lat và lng.' });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    try {
        const nearestBranch = await Branch.findOne({
            location: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [longitude, latitude] // Lưu ý: MongoDB dùng [Lng, Lat]
                    },
                    // $maxDistance: 20000 // (Tùy chọn) Tìm trong bán kính 20km
                }
            }
        });

        if (!nearestBranch) {
            return res.status(404).json({ message: 'Không tìm thấy chi nhánh nào gần bạn.' });
        }

        res.status(200).json(nearestBranch);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi tìm chi nhánh gần nhất', error: error.message });
    }
};

export const updateBranch = async (req, res) => {
    try {
        const { name, address, lat, lng, phoneNumber, operatingHours } = req.body;
        const branch = await Branch.findById(req.params.id);

        if (branch) {
            branch.name = name || branch.name;
            branch.address = address || branch.address;
            branch.phoneNumber = phoneNumber || branch.phoneNumber;
            branch.operatingHours = operatingHours || branch.operatingHours;

            // Cập nhật tọa độ nếu có
            if (lat && lng) {
                branch.location = {
                    type: 'Point',
                    coordinates: [parseFloat(lng), parseFloat(lat)] // Mongo: [Lng, Lat]
                };
            }

            const updatedBranch = await branch.save();
            res.json(updatedBranch);
        } else {
            res.status(404).json({ message: 'Không tìm thấy chi nhánh' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Lỗi cập nhật', error: error.message });
    }
};

// Xóa chi nhánh
export const deleteBranch = async (req, res) => {
    try {
        const branch = await Branch.findById(req.params.id);
        if (branch) {
            await branch.deleteOne();
            res.json({ message: 'Chi nhánh đã được xóa' });
        } else {
            res.status(404).json({ message: 'Không tìm thấy chi nhánh' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Lỗi xóa chi nhánh', error: error.message });
    }
};